import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Shield, Check, AlertCircle } from "lucide-react";
import { useToast, ToastAction } from "../../hooks/ToastComponent";

const TwoFactorAuth = () => {
  const user = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  };
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate 2FA secret and QR code on component mount
    const generateSecret = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/generate-2fa-secret", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          const data = await response.json();
          setQrCodeUrl(data.qrCodeUrl);
          setSecret(data.secret);
        } else {
          toast({
            title: "Error",
            description: "Failed to generate 2FA secret",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to generate 2FA secret:", error);
        toast({
          title: "Error",
          description: "Failed to generate 2FA secret",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Generate a demo QR Code for demonstration purposes
    const generateDemoQRCode = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo, we'll use a hardcoded QR code URL that works with Google Authenticator
        // In a real app, this would be generated on the server with a unique secret for each user
        const demoSecret = "JBSWY3DPEHPK3PXP"; // Example secret - this is just for demo purposes
        setSecret(demoSecret);

        // This URL would typically be generated from the server with QRCode library
        // For demo, we're using Google Charts API to generate a QR code
        const serviceName = "InvestGrow";
        const userName = user.email;
        const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/${encodeURIComponent(
          serviceName
        )}:${encodeURIComponent(
          userName
        )}%3Fsecret=${demoSecret}%26issuer=${encodeURIComponent(serviceName)}`;

        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error("Failed to generate demo QR code:", error);
        toast({
          title: "Error",
          description: "Failed to generate demo QR code",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateDemoQRCode();
  }, [user, toast]);

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // In a real app, this would be verified on the server
      // For demo, we'll simulate a successful verification if code length is 6 digits
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsVerified(true);
        toast({
          title: "Success",
          description: "Two-factor authentication has been enabled",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to verify code:", error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-primary-500 mr-2" />
          <CardTitle>Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Enhance your account security with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVerified ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Two-Factor Authentication Enabled
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Your account is now protected with an additional layer of
                security.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                      Important Steps
                    </h3>
                    <ol className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 list-decimal pl-4 space-y-1">
                      <li>
                        Download Google Authenticator or another TOTP app on
                        your mobile device
                      </li>
                      <li>Scan the QR code below with your app</li>
                      <li>Enter the 6-digit verification code from your app</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg shadow-inner border">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for 2FA"
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                ) : (
                  <div className="animate-pulse bg-gray-200 w-[200px] h-[200px] rounded-lg"></div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter 6-digit verification code:
                </label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-center tracking-widest text-lg"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        {!isVerified && (
          <Button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6 || !qrCodeUrl}
          >
            {isLoading ? "Verifying..." : "Enable Two-Factor Authentication"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwoFactorAuth;
