import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./Invest.css";

const Invest = () => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    if (!navigator.onLine) {
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Page will automatically refresh content when connection is restored
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  const handleDepositClick = () => {
    // Check network status before opening deposit modal
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    setShowDepositModal(true);
  };

  return (
    <>
      <Card className="invest-header-card">
        <CardContent className="invest-header-content">
          <div className="invest-title-container">
            <TrendingUp className="invest-title-icon" />
            <h1 className="invest-title">Investment Plans</h1>
          </div>
          <p className="invest-description">
            Choose an investment plan that suits your goals. Higher minimum
            investments provide better daily returns.
          </p>

          <div className="invest-alert">
            <div className="invest-alert-content">
              <AlertCircle className="invest-alert-icon" />
              <div>
                <h3 className="invest-alert-title">Important Information</h3>
                <p className="invest-alert-message">
                  Your investment plan is automatically determined by your
                  wallet balance. Larger investments qualify for higher daily
                  return rates.
                </p>
              </div>
            </div>
          </div>

          <div className="invest-action-container">
            <Button
              onClick={handleDepositClick}
              size="lg"
              className="invest-deposit-button"
            >
              Deposit Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full detailed view of all investment plans */}
      <InvestmentPlans
        showAll={true}
        showDetailed={true}
        title="Available Investment Plans"
      />

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Invest;
