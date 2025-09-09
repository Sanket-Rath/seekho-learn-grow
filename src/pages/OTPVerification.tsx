import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Mail } from 'lucide-react';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, redirect to auth page
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get stored signup data
      const pendingSignupData = sessionStorage.getItem('pendingSignup');
      if (!pendingSignupData) {
        throw new Error('No pending signup data found. Please start the registration process again.');
      }

      const signupData = JSON.parse(pendingSignupData);
      
      // Verify OTP and create account
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email,
          otp,
          password: signupData.password,
          fullName: signupData.fullName,
          role: signupData.role
        }
      });

      if (error || !data.success) {
        toast({
          title: "Verification failed",
          description: error?.message || data?.error || "Invalid verification code",
          variant: "destructive",
        });
      } else {
        // Clear pending signup data
        sessionStorage.removeItem('pendingSignup');
        
        toast({
          title: "Account created successfully!",
          description: "You can now sign in with your credentials.",
        });
        
        // Redirect to auth page to sign in
        navigate('/auth');
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      // Get stored signup data for fullName
      const pendingSignupData = sessionStorage.getItem('pendingSignup');
      let fullName = '';
      if (pendingSignupData) {
        const signupData = JSON.parse(pendingSignupData);
        fullName = signupData.fullName;
      }

      const { data, error } = await supabase.functions.invoke('generate-otp', {
        body: {
          email,
          fullName
        }
      });

      if (error || !data.success) {
        toast({
          title: "Failed to resend",
          description: error?.message || "Failed to generate new verification code",
          variant: "destructive",
        });
      } else {
        toast({
          title: "OTP sent",
          description: "A new verification code has been sent to your email.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">SEEKHO</h1>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm"
              >
                {isResending ? 'Resending...' : 'Resend verification code'}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm"
              >
                Back to sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;