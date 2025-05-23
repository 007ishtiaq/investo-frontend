// client/src/pages/legal/TermsAndConditions.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Legal.css";

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-container">
      <div className="legal-header animate-fade-in">
        <h1>Terms and Conditions</h1>
        <p>Last updated: May 15, 2025</p>
      </div>

      <div className="legal-content animate-fade-in-delay">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Investo ("Company", "we", "our", "us")! These Terms and
            Conditions ("Terms", "Terms and Conditions") govern your use of our
            website and investment platform (together or individually, the
            "Service") operated by Investo.
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you disagree with any part of the terms, you may not
            access the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Investment Risk Disclosure</h2>
          <p>
            <strong>Investment Risk:</strong> All investments involve risk, and
            the past performance of a security, industry, sector, market,
            financial product, trading strategy, or individual's investment does
            not guarantee future results or returns. Investors are urged to
            consider all risks and uncertainties before investing.
          </p>
          <p>
            <strong>Potential for Loss:</strong> Users understand and
            acknowledge that investments can lose value, and users may lose part
            or all of their investment. The platform does not guarantee any
            return on investment.
          </p>
          <p>
            <strong>Advice Disclaimer:</strong> The information provided on the
            platform is for informational purposes only and does not constitute
            financial advice, investment advice, trading advice, or any other
            advice.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Accounts and Membership</h2>
          <p>
            When you create an account with us, you must provide accurate,
            complete, and current information at all times. Failure to do so
            constitutes a breach of the Terms, which may result in immediate
            termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password you use to access
            the Service and for any activities or actions under your password.
            You agree not to disclose your password to any third party. You must
            notify us immediately upon becoming aware of any breach of security
            or unauthorized use of your account.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Investment Plans and Payouts</h2>
          <p>
            <strong>Investment Plans:</strong> Our platform offers various
            investment plans with different returns, durations, and minimum
            investment amounts. The specific terms of each plan are described on
            the platform and may be updated from time to time.
          </p>
          <p>
            <strong>Payout Schedule:</strong> Profits are distributed according
            to the schedule specified in each investment plan. The Company
            reserves the right to adjust payout schedules due to technical
            issues, market conditions, or other unforeseen circumstances.
          </p>
          <p>
            <strong>Profit Calculation:</strong> Profits are calculated based on
            the investment amount and the specified rate of return. All
            calculations are made in the currency specified in the investment
            plan.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Deposits and Withdrawals</h2>
          <p>
            <strong>Deposits:</strong> Users may deposit funds using the payment
            methods available on the platform. The minimum deposit amount is
            specified on the platform and may vary by investment plan.
          </p>
          <p>
            <strong>Withdrawal Process:</strong> Withdrawal requests are
            processed within the timeframe specified on the platform. The
            Company reserves the right to request additional verification
            information before processing a withdrawal.
          </p>
          <p>
            <strong>Withdrawal Fees:</strong> Withdrawals may be subject to
            processing fees as specified on the platform. These fees may change
            from time to time.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. KYC and AML Compliance</h2>
          <p>
            <strong>Identity Verification:</strong> We require users to complete
            identity verification procedures (Know Your Customer, "KYC") to
            comply with applicable laws and regulations. Failure to complete
            these procedures may result in limitations on account activities.
          </p>
          <p>
            <strong>Prohibited Activities:</strong> The Service may not be used
            for any activity that violates applicable anti-money laundering
            (AML) laws and regulations, including money laundering, terrorist
            financing, or fraud.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately
            cease. If you wish to terminate your account, you may simply
            discontinue using the Service or contact us to request account
            deletion.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Investo, its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will try to
            provide at least 30 days' notice prior to any new terms taking
            effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> support@investo.com
            <br />
            <strong>Address:</strong> 123 Investment Avenue, Finance District,
            54321
          </p>
        </section>
      </div>

      <div className="legal-footer">
        <div className="link-hover-effect">
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="link-hover-effect">
          <Link to="/cookies">Cookie Policy</Link>
        </div>
        <div className="link-hover-effect">
          <Link to="/">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
