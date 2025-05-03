import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingUp, AlertCircle } from "lucide-react";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import "./Invest.css";

const Invest = () => {
  const [showDepositModal, setShowDepositModal] = useState(false);

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
              onClick={() => setShowDepositModal(true)}
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
    </>
  );
};

export default Invest;
