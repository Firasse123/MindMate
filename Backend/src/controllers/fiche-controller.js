import Fiche from "../models/Fiche.js";
import LevelService from "../services/levelService.js";
import StudySession from "../models/StudySession.js";

export const getFilteredFiches = async (req, res) => {
    try{
        const userId = req.userId;
        const { search, domain, difficulty, sortBy, page = 1, limit = 20 } = req.query;
        
        // Build query object
        let query = { author: userId };
        
        // Add search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'classification.topics': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add domain filter
        if (domain && domain !== 'all') {
            query['classification.domain'] = domain;
        }
        
        // Add difficulty filter
        if (difficulty && difficulty !== 'all') {
            query['classification.difficulty'] = difficulty;
        }
        
        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'title':
                sort = { title: 1 };
                break;
            case 'quality':
                sort = { 'qualityScore.score': -1 };
                break;
            case 'recent':
            default:
                sort = { createdAt: -1 };
                break;
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Execute query with pagination
        const sheets = await Fiche.find(query)
            .populate("author", "username email")
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination info
        const totalCount = await Fiche.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        
        res.status(200).json({
            sheets,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch(error) {
        console.error('Error fetching fiches:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getAllFiches=async(req,res)=>{
    try {

    const fiches = await Fiche.find({ author: req.userId }); 
    if(!fiches){
        return res.status(404).json({message:"Fiche Not Found"});
    }
    res.status(200).json(fiches)
    }
    catch(error){
        res.status(500).json({message:error})
    }
}

const FASTAPI_URL = "http://127.0.0.1:8000/generate-fiche";
// Fixed fiche-controller.js generateFiche function with better error handling
export const generateFiche = async(req, res) => {
    const {domain, difficulty, text} = req.body;
    
    console.log('🚀 Starting sheet generation...', {
        domain,
        difficulty,
        textLength: text?.length,
        userId: req.userId
    });
    
    if (!domain || !difficulty || !text) {
        console.error('❌ Missing required fields:', { domain, difficulty, hasText: !!text });
        return res.status(400).json({ 
            error: "domain, difficulty, and text are required",
            received: { domain, difficulty, hasText: !!text }
        });
    }
    
    if (!req.userId) {
        console.error('❌ Missing userId from auth middleware');
        return res.status(401).json({ error: "User authentication required" });
    }
    
    try {
        const startTime = Date.now();
        
        console.log('📡 Calling FastAPI at:', FASTAPI_URL);
        
        // Add timeout for FastAPI call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch(FASTAPI_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({domain, difficulty, text}),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 FastAPI Response:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ FastAPI Error Response:', errorText);
            return res.status(response.status).json({ 
                error: `FastAPI service error: ${response.statusText}`,
                details: errorText
            });
        }
        
        const result = await response.json();
        console.log('✅ FastAPI Success:', {
            hasFiche: !!result.fiche,
            ficheKeys: result.fiche ? Object.keys(result.fiche) : [],
            resultKeys: Object.keys(result)
        });
        
        if (!result.fiche) {
            console.error('❌ No fiche in FastAPI response:', result);
            return res.status(500).json({ 
                error: "FastAPI did not return a fiche object",
                received: result
            });
        }
        
        // Create fiche with error handling
        console.log('💾 Creating fiche in database...');
        const newFiche = await Fiche.create({
            ...result.fiche,
            author: req.userId
        });
        console.log('✅ Fiche created with ID:', newFiche._id);
        
        // Create study session with error handling
        console.log('📊 Creating study session...');
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        const studySession = await StudySession.create({
            user: req.userId,
            fiche: newFiche._id,
            sessionType: "sheet_generation",
            aiInteraction: {
                messagesExchanged: 1,
                personalizedPath: {
                    recommendedTopics: result.fiche.classification?.topics || [],
                    suggestedDifficulty: difficulty
                }
            },
            results: {
                timeSpent: timeSpent,
                completionRate: 100
            },
            status: "completed",
            completedAt: new Date()
        });
        console.log('✅ Study session created with ID:', studySession._id);
        
        // Award XP with error handling
        console.log('🎖️ Awarding XP...');
        try {
            const xpResult = await LevelService.awardXP(req.userId, "SHEET_CREATED");
            console.log('✅ XP awarded:', xpResult);
            
            await LevelService.updateStreak(req.userId);
            console.log('✅ Streak updated');
            
            res.status(201).json({
                success: true,
                msg: "Fiche saved successfully",
                fiche: newFiche,
                studySession: studySession,
                xpResult: xpResult
            });
            
        } catch (xpError) {
            console.error('⚠️ XP award failed but fiche created:', xpError);
            // Don't fail the whole request - fiche was created successfully
            res.status(201).json({
                success: true,
                msg: "Fiche saved successfully (XP award failed)",
                fiche: newFiche,
                studySession: studySession,
                xpError: xpError.message
            });
        }
        
    } catch (err) {
        console.error('❌ Sheet generation error:', {
            message: err.message,
            name: err.name,
            stack: err.stack?.split('\n').slice(0, 5).join('\n')
        });
        
        // Handle specific error types
        if (err.name === 'AbortError') {
            return res.status(408).json({ 
                error: "Request timeout - FastAPI took too long to respond",
                suggestion: "Try with shorter text or check if FastAPI service is running"
            });
        }
        
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Cannot connect to AI service",
                suggestion: "Ensure FastAPI server is running on the correct port"
            });
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Database validation error",
                details: err.message
            });
        }
        
        // Generic error response
        res.status(500).json({ 
            error: "Internal server error during sheet generation",
            message: err.message,
            type: err.name,
            // Include stack trace only in development
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
}
const FAST_API="http://127.0.0.1:8000/evaluate-fiche"
export const evaluateFiche = async(req, res) => {
    try {
        console.log('🚀 Starting fiche evaluation...');
        const {fiche_content} = req.body;
        const startTime = Date.now();
        
        console.log('📝 Fiche content:', fiche_content?.substring(0, 100) + '...');
        
        // Call Python FastAPI backend
        console.log('🔄 Calling FastAPI backend...');
        const response = await fetch(FAST_API, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({fiche_content})
        });
        
        console.log('📡 FastAPI Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ FastAPI Error:', errorText);
            throw new Error(`FastAPI returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ FastAPI Success:', {
            title: result.title,
            hasClassification: !!result.classification,
            hasQualityScore: !!result.qualityScore,
            hasImprovedFiche: !!result.improvedFiche
        });
        
        // Create new fiche with correct data structure
        const newFiche = await Fiche.create({
            title: result.title, // ✅ Direct access, no 'fiche' wrapper
            content: fiche_content,
            classification: result.classification, // ✅ Direct access
            qualityScore: result.qualityScore, // ✅ Direct access
            improvements: result.improvements || result.improvedFiche?.improvements,
            improvedFiche: {
                title: result.improvedFiche?.title || result.title,
                content: result.improvedFiche?.content || fiche_content
            },
            author: req.userId,
        });

        console.log('💾 Fiche created with ID:', newFiche._id);

        // Create study session for evaluation
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        const studySession = await StudySession.create({
            user: req.userId,
            fiche: newFiche._id,
            sessionType: "review", // evaluation is a review activity
            aiInteraction: {
                messagesExchanged: 1,
                helpRequested: 1,
                personalizedPath: {
                    recommendedTopics: newFiche.classification?.topics || [],
                    suggestedDiffculty: newFiche.classification?.difficulty || "medium"
                }
            },
            results: {
                score: result.qualityScore?.score || 0, // ✅ Access nested score
                timeSpent: timeSpent,
                completionRate: 100
            },
            status: "completed",
            completedAt: new Date()
        });

        console.log('📊 Study session created with ID:', studySession._id);
        
        // Award XP
        try {
            await LevelService.awardXP(req.userId, "SHEET_EVALUATED");
            await LevelService.updateStreak(req.userId);
            console.log('🎖️ XP awarded successfully');
        } catch (xpError) {
            console.error('⚠️ XP award failed:', xpError.message);
            // Don't fail the whole request for XP issues
        }
        
        console.log('✅ Evaluation completed successfully');
        res.status(200).json({
            fiche: newFiche,
            studySession: studySession
        });
        
    } catch(error) {
        console.error('❌ Evaluation error:', {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n') // Limit stack trace
        });
        
        res.status(500).json({
            error: error.message || "Error evaluating fiche",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

export const deleteFiche = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFiche = await Fiche.findByIdAndDelete(id);

    if (!deletedFiche) {
      return res.status(404).json({ error: "Fiche not found" });
    }

    res.status(200).json({ msg: "Fiche successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFiche=async (req,res)=>{
    const {id}=req.params;
    const updates=req.body;
    try{
        const updatedFiche=await Fiche.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true } 
        )
        if(!updatedFiche){
            return res.status(500).json({message:"Fiche not found"});
        }
        res.status(200).json(updatedFiche);
    }
    catch(error){
        console.error("error" ,error);
        res.status(500).json({ error: "Internal Server Error" });

    }
}
export const getFiche=async (req,res)=>{
    const {id}=req.params;
    try{            
        const fiche=await Fiche.findById(id);
        if(!fiche){
            return res.status(404).json({error:"Fiche not Found"})
        }
        else{
            res.status(200).json(fiche);
        }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}

export const getAvailableDomains = async (req, res) => {
    try {
        const userId = req.userId;
        
        const domains = await Fiche.distinct('classification.domain', { author: userId });
        
        // Remove null/undefined values and sort
        const validDomains = domains.filter(domain => domain).sort();
        
        res.status(200).json({
            domains: validDomains
        });
        
    } catch (error) {
        console.error('Error fetching domains:', error);
        res.status(500).json({ error: error.message });
    }
}

// New endpoint to get available difficulties dynamically
export const getAvailableDifficulties = async (req, res) => {
    try {
        const userId = req.userId;
        
        const difficulties = await Fiche.distinct('classification.difficulty', { author: userId });
        
        // Remove null/undefined values and sort by predefined order
        const difficultyOrder = ['easy', 'medium', 'hard'];
        const validDifficulties = difficulties
            .filter(difficulty => difficulty)
            .sort((a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b));
        
        res.status(200).json({
            difficulties: validDifficulties
        });
        
    } catch (error) {
        console.error('Error fetching difficulties:', error);
        res.status(500).json({ error: error.message });
    }
}

