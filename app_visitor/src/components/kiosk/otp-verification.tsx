import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";

interface OtpVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function OtpVerification({
  phoneNumber,
  onVerified,
  onCancel,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Start countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Simulate sending OTP
  useEffect(() => {
    // In a real app, this would be an API call to send the OTP
    console.log(`Sending OTP to ${phoneNumber}`);
    console.log("For demo purposes, use code: 1234");
  }, [phoneNumber]);

  const handleVerify = () => {
    if (otp.length < 4) {
      setError("Please enter a valid OTP code");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate OTP verification - in a real app, this would be an API call
    setTimeout(() => {
      // For demo purposes, any 4-digit code works
      if (otp.length === 4) {
        setIsLoading(false);
        console.log("OTP verified successfully");
        onVerified();
      } else {
        setIsLoading(false);
        setError("Invalid OTP code. Please try again.");
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    setOtp("");
    setError(null);
    setCountdown(30);
    setCanResend(false);

    // Simulate resending OTP
    console.log(`Resending OTP to ${phoneNumber}`);
    console.log("For demo purposes, use code: 1234");
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verify Your Phone</h2>
        <p className="text-muted-foreground">
          We've sent a verification code to {phoneNumber}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          For demo purposes, use any 4-digit code (e.g., 1234)
        </p>
      </div>

      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-base font-medium">
            Enter Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className="h-16 text-center text-2xl tracking-widest"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setOtp(value);
              setError(null);
            }}
            placeholder="0000"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="text-center text-sm">
          {canResend ? (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={handleResendOtp}
            >
              Resend verification code
            </button>
          ) : (
            <p>
              Resend code in <span className="font-medium">{countdown}</span>{" "}
              seconds
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-lg"
          onClick={onCancel}
        >
          <X className="mr-2 h-5 w-5" /> Cancel
        </Button>
        <Button
          size="lg"
          className="flex-1 text-lg"
          onClick={handleVerify}
          disabled={otp.length < 4 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
