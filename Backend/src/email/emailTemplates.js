
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #160C3C 0%, #180C3D 50%, #8961FF 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(24, 12, 61, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #8961FF 0%, #57AFF0 100%); padding: 50px 40px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        <div style="position: relative; z-index: 1;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MindMate</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px; font-weight: 300;">Verify Your Email</p>
        </div>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 50px 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #180C3D; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Welcome aboard! 🚀</h2>
          <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">We're excited to have you join us. Please verify your email address to complete your registration.</p>
        </div>
        
        <!-- Verification Code -->
        <div style="background: linear-gradient(135deg, #57AFF0 0%, #53B4EE 100%); border-radius: 20px; padding: 40px; text-align: center; margin: 40px 0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite;"></div>
          <p style="color: white; margin: 0 0 16px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Your Verification Code</p>
          <div style="position: relative; z-index: 1;">
            <span style="font-size: 48px; font-weight: 800; letter-spacing: 8px; color: white; text-shadow: 0 4px 8px rgba(0,0,0,0.2); font-family: 'Courier New', monospace;">{verificationCode}</span>
          </div>
        </div>
        
        <!-- Instructions -->
        <div style="background: #f8f9ff; border-radius: 16px; padding: 32px; margin: 32px 0; border-left: 4px solid #8961FF;">
          <div>
            <h3 style="color: #180C3D; margin: 0 0 12px; font-size: 18px; font-weight: 600;">Quick Setup</h3>
            <p style="color: #666; margin: 0 0 8px; line-height: 1.6;">1. Copy the verification code above</p>
            <p style="color: #666; margin: 0 0 8px; line-height: 1.6;">2. Return to the verification page</p>
            <p style="color: #666; margin: 0; line-height: 1.6;">3. Paste the code and continue</p>
          </div>
        </div>
        
        <!-- Security Notice -->
        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="flex: 1;">
              <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 500;">This code expires in 15 minutes for your security.</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Didn't create an account? You can safely ignore this email.</p>
          <p style="color: #180C3D; margin: 0; font-weight: 600;">Best regards,<br><span style="color: #8961FF;">The MindMate Team</span></p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="color: rgba(255, 255, 255, 0.5); margin: 0; font-size: 11px;">© 2024 MindMate. All rights reserved.</p>
      </div>
    </div>
  </div>
  
  <style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css');
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.2; }
      50% { transform: scale(1.05); opacity: 0.05; }
    }
  </style>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #160C3C 0%, #180C3D 50%, #8961FF 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(24, 12, 61, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #8961FF 0%, #57AFF0 100%); padding: 50px 40px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        <div style="position: relative; z-index: 1;">
          <h1 style="color: white; margin: 0 0 10px; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Password Reset Successful</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 18px; font-weight: 300;">Security Update Complete</p>
        </div>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 50px 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: 64px; margin-bottom: 30px;">🔒</div>
          <h2 style="color: #180C3D; margin: 0 0 16px; font-size: 28px; font-weight: 600;">All Set!</h2>
          <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">We're writing to confirm that your password has been successfully reset. Your account is now secure with your new credentials.</p>
        </div>
        
        <!-- Success Confirmation -->
        <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(69, 160, 73, 0.1) 100%); border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 20px; padding: 32px; margin: 32px 0; text-align: center;">
          <div style="background-color: #4CAF50; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; display: inline-block; font-size: 32px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">
            ✓
          </div>
          <h3 style="color: #180C3D; margin: 0 0 16px; font-size: 20px; font-weight: 600;">Password Successfully Updated</h3>
          <p style="color: #666; margin: 0; line-height: 1.6;">If you did not initiate this password reset, please contact our support team immediately.</p>
        </div>
        
        <!-- Security Recommendations -->
        <div style="background: #f8f9ff; border-radius: 16px; padding: 32px; margin: 32px 0; border-left: 4px solid #4CAF50;">
          <h3 style="color: #180C3D; margin: 0 0 20px; font-size: 18px; font-weight: 600;">🛡️ Security Best Practices</h3>
          <div style="margin-bottom: 16px;">
            <span style="color: #4CAF50; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Use a strong, unique password</span>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: #4CAF50; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Enable two-factor authentication if available</span>
          </div>
          <div>
            <span style="color: #4CAF50; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Avoid using the same password across multiple sites</span>
          </div>
        </div>
        
        <!-- Support Section -->
        <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <span style="font-size: 20px; flex-shrink: 0;">💬</span>
            <div style="flex: 1;">
              <p style="color: #180C3D; margin: 0; font-size: 14px; font-weight: 500;">Need help or have security concerns? Our support team is here for you!</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Thank you for helping us keep your account secure.</p>
          <p style="color: #180C3D; margin: 0; font-weight: 600;">Best regards,<br><span style="color: #4CAF50;">Your App Team</span></p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="color: rgba(255, 255, 255, 0.5); margin: 0; font-size: 11px;">© 2024 Your App. All rights reserved.</p>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .success-icon {
      animation: pulse 2s ease-in-out infinite;
    }
  </style>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #160C3C 0%, #180C3D 50%, #8961FF 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(24, 12, 61, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #8961FF 0%, #57AFF0 100%); padding: 50px 40px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        <div style="position: relative; z-index: 1;">
          <h1 style="color: white; margin: 0 0 10px; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Password Reset Request</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 18px; font-weight: 300;">Secure Your Account</p>
        </div>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 50px 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: 64px; margin-bottom: 30px;">🔑</div>
          <h2 style="color: #180C3D; margin: 0 0 16px; font-size: 28px; font-weight: 600;">Reset Your Password</h2>
          <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your account. Click the button below to create a new password.</p>
        </div>
        
        <!-- Reset Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a  href="{resetURL}" style="display: inline-block; background: linear-gradient(135deg, #8961FF 0%, #57AFF0 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 24px rgba(137, 97, 255, 0.3); transition: all 0.3s ease; border: none;">
            Reset My Password
          </a>
        </div>
        
        <!-- Security Notice -->
        <div style="background: linear-gradient(135deg, rgba(137, 97, 255, 0.1) 0%, rgba(87, 175, 240, 0.1) 100%); border: 1px solid rgba(137, 97, 255, 0.2); border-radius: 20px; padding: 32px; margin: 32px 0; text-align: center;">
          <h3 style="color: #180C3D; margin: 0 0 16px; font-size: 20px; font-weight: 600;">⚠️ Important Security Notice</h3>
          <p style="color: #666; margin: 0; line-height: 1.6;">This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email or contact our support team.</p>
        </div>
        
        <!-- Security Tips -->
        <div style="background: #f8f9ff; border-radius: 16px; padding: 32px; margin: 32px 0; border-left: 4px solid #8961FF;">
          <h3 style="color: #180C3D; margin: 0 0 20px; font-size: 18px; font-weight: 600;">🛡️ Password Security Tips</h3>
          <div style="margin-bottom: 16px;">
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Use a strong, unique password with 12+ characters</span>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Include uppercase, lowercase, numbers, and symbols</span>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Enable two-factor authentication if available</span>
          </div>
          <div>
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Avoid reusing passwords across multiple sites</span>
          </div>
        </div>
        
        <!-- Alternative Access -->
        <div style="background: rgba(137, 97, 255, 0.1); border: 1px solid rgba(137, 97, 255, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <span style="font-size: 20px; flex-shrink: 0;">💻</span>
            <div style="flex: 1;">
              <p style="color: #180C3D; margin: 0 0 8px; font-size: 14px; font-weight: 500;">Can't click the button?</p>
              <p style="color: #666; margin: 0; font-size: 12px;">Copy and paste this link into your browser: <span style="color: #8961FF; font-weight: 500;">[RESET_LINK_URL]</span></p>
            </div>
          </div>
        </div>
        
        <!-- Support Section -->
        <div style="background: rgba(137, 97, 255, 0.1); border: 1px solid rgba(137, 97, 255, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <span style="font-size: 20px; flex-shrink: 0;">💬</span>
            <div style="flex: 1;">
              <p style="color: #180C3D; margin: 0; font-size: 14px; font-weight: 500;">Need help or have security concerns? Our support team is here for you!</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Thank you for keeping your account secure.</p>
          <p style="color: #180C3D; margin: 0; font-weight: 600;">Best regards,<br><span style="color: #8961FF;">Your App Team</span></p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="color: rgba(255, 255, 255, 0.5); margin: 0; font-size: 11px;">© 2024 Your App. All rights reserved.</p>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes glow {
      0%, 100% { box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3); }
      50% { box-shadow: 0 8px 32px rgba(255, 107, 53, 0.5); }
    }
    
    a:hover {
      transform: translateY(-2px);
      animation: glow 2s ease-in-out infinite;
    }
  </style>
</body>
</html>
`;
export const welcomeEmail=(name)=>{
  return`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #160C3C 0%, #180C3D 50%, #8961FF 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(24, 12, 61, 0.3); border: 1px solid rgba(255, 255, 255, 0.2);">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #8961FF 0%, #57AFF0 100%); padding: 50px 40px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        <div style="position: relative; z-index: 1;">
          <h1 style="color: white; margin: 0 0 10px; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to MindMate!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 18px; font-weight: 300;">Hello ${name} 🎉</p>
        </div>
      </div>
      
      <!-- Content Section -->
            <div style="padding: 50px 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="background: linear-gradient(135deg, #57AFF0 0%, #53B4EE 100%); border-radius: 20px; padding: 30px; margin: 0 auto 30px; max-width: 200px; box-shadow: 0 10px 30px rgba(87, 175, 240, 0.3);">
            <div style="text-align: center;">
              <span style="font-size: 48px; display: block; margin-bottom: 8px;">🚀</span>
              <span style="color: white; font-size: 16px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Ready to Launch</span>
            </div>
          </div>
          <h2 style="color: #180C3D; margin: 0 0 16px; font-size: 28px; font-weight: 600;">You're All Set!</h2>
          <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">We're thrilled to have you join the MindMate community. Your email has been successfully verified and you're ready to begin your journey!</p>
        </div>
        
        <!-- Success Message -->
        <div style="background: linear-gradient(135deg, rgba(87, 175, 240, 0.1) 0%, rgba(83, 180, 238, 0.1) 100%); border: 1px solid rgba(87, 175, 240, 0.2); border-radius: 20px; padding: 32px; margin: 32px 0; text-align: center;">
          <h3 style="color: #180C3D; margin: 0 0 16px; font-size: 20px; font-weight: 600;">🎯 What's Next?</h3>
          <p style="color: #666; margin: 0; line-height: 1.6;">Start exploring all the features MindMate has to offer. We've designed everything with you in mind to make your experience seamless and enjoyable.</p>
        </div>
        
        <!-- Quick Links -->
        <div style="background: #f8f9ff; border-radius: 16px; padding: 32px; margin: 32px 0; border-left: 4px solid #8961FF;">
          <h3 style="color: #180C3D; margin: 0 0 20px; font-size: 18px; font-weight: 600;">Quick Start Guide</h3>
          <div style="margin-bottom: 16px;">
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Complete your profile setup</span>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Explore the dashboard features</span>
          </div>
          <div>
            <span style="color: #8961FF; font-weight: bold;">✓</span>
            <span style="color: #666; margin-left: 12px;">Connect with our community</span>
          </div>
        </div>
        
        <!-- Support Section -->
        <div style="background: rgba(137, 97, 255, 0.1); border: 1px solid rgba(137, 97, 255, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="flex: 1;">
              <p style="color: #180C3D; margin: 0; font-size: 14px; font-weight: 500;">  Need help getting started? Our support team is here for you!</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Thanks for choosing MindMate. Let's build something amazing together!</p>
          <p style="color: #180C3D; margin: 0; font-weight: 600;">Best regards,<br><span style="color: #8961FF;">The MindMate Team</span></p>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="color: rgba(255, 255, 255, 0.5); margin: 0; font-size: 11px;">© 2024 MindMate. All rights reserved.</p>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
  </style>
</body>
</html>
`}