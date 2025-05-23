// client/src/pages/legal/PrivacyPolicy.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Legal.css";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-container">
      <div className="legal-header animate-fade-in">
        <h1>Privacy Policy</h1>
        <p>Last updated: May 15, 2025</p>
      </div>

      <div className="legal-content animate-fade-in-delay">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            At Investo, we respect your privacy and are committed to protecting
            your personal data. This Privacy Policy will inform you about how we
            look after your personal data when you visit our platform and tell
            you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>
            <strong>Personal Information:</strong> We collect personal
            information that you provide to us, including but not limited to:
          </p>
          <ul>
            <li>Contact information (name, email address, phone number)</li>
            <li>Account information (username, password)</li>
            <li>
              Financial information (bank account details, transaction history)
            </li>
            <li>
              Identity verification information (government ID, proof of
              address)
            </li>
            <li>Communications with us</li>
          </ul>
          <p>
            <strong>Automatically Collected Information:</strong> When you use
            our platform, we automatically collect certain information about
            your device and usage, including:
          </p>
          <ul>
            <li>
              Device information (IP address, browser type, operating system)
            </li>
            <li>Usage data (pages visited, time spent, actions taken)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your personal information for the following purposes:</p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To process and manage your investments and transactions</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To communicate with you about your account and investments</li>
            <li>
              To comply with legal obligations and regulatory requirements
            </li>
            <li>To improve and personalize our service</li>
            <li>To analyze usage patterns and conduct research</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Sharing and Disclosure</h2>
          <p>We may share your personal information with:</p>
          <ul>
            <li>Service providers who help us operate our platform</li>
            <li>Financial partners involved in processing transactions</li>
            <li>Identity verification and fraud prevention services</li>
            <li>Legal and regulatory authorities when required by law</li>
            <li>Business partners with your consent</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="legal-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. These measures include
            encryption, access controls, regular security assessments, and staff
            training.
          </p>
          <p>
            However, no method of transmission over the Internet or electronic
            storage is 100% secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to
            fulfill the purposes for which we collected it, including satisfying
            legal, accounting, or reporting requirements. For financial
            information, we typically retain data for at least five years after
            the end of our relationship to comply with regulatory requirements.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul>
            <li>
              Right to access and receive a copy of your personal information
            </li>
            <li>Right to correct inaccurate or incomplete information</li>
            <li>
              Right to delete your personal information in certain circumstances
            </li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the details
            provided below.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. International Transfers</h2>
          <p>
            Your personal information may be transferred to and processed in
            countries other than the one in which you reside. These countries
            may have different data protection laws. When we transfer your data
            internationally, we take steps to ensure that appropriate safeguards
            are in place to protect your information.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. For significant changes, we
            will provide a more prominent notice or direct notification.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <p>
            <strong>Data Protection Officer</strong>
            <br />
            Email: privacy@investo.com
            <br />
            Address: 123 Investment Avenue, Finance District, 54321
          </p>
        </section>
      </div>

      <div className="legal-footer">
        <div className="link-hover-effect">
          <Link to="/terms">Terms and Conditions</Link>
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

export default PrivacyPolicy;
