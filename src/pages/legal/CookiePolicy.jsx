// client/src/pages/legal/CookiePolicy.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Legal.css";

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-container">
      <div className="legal-header animate-fade-in">
        <h1>Cookie Policy</h1>
        <p>Last updated: May 15, 2025</p>
      </div>

      <div className="legal-content animate-fade-in-delay">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            This Cookie Policy explains how Investo ("we", "our", "us") uses
            cookies and similar technologies on our website and investment
            platform. It explains what these technologies are and why we use
            them, as well as your rights to control our use of them.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. What Are Cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or
            mobile device when you visit a website. They are widely used to make
            websites work efficiently and provide information to the owners of
            the site.
          </p>
          <p>
            Cookies set by the website owner (in this case, Investo) are called
            "first-party cookies." Cookies set by parties other than the website
            owner are called "third-party cookies." Third-party cookies enable
            third-party features or functionality to be provided on or through
            the website, such as advertising, interactive content, and
            analytics.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Types of Cookies We Use</h2>
          <p>
            <strong>Essential Cookies:</strong>
          </p>
          <p>
            These cookies are necessary for the website to function properly.
            They enable basic functions like page navigation, secure areas
            access, and enable online payments. The website cannot function
            properly without these cookies.
          </p>

          <p>
            <strong>Preference Cookies:</strong>
          </p>
          <p>
            These cookies enable the website to remember choices you make (such
            as your preferred language or the region you are in) and provide
            enhanced, more personalized features.
          </p>

          <p>
            <strong>Analytics and Performance Cookies:</strong>
          </p>
          <p>
            These cookies collect information about how visitors use our
            website, including which pages visitors go to most often and if they
            receive error messages. They help us improve our website and measure
            the effectiveness of our advertising campaigns.
          </p>

          <p>
            <strong>Marketing Cookies:</strong>
          </p>
          <p>
            These cookies track your online activity to help advertisers deliver
            more relevant advertising or to limit how many times you see an ad.
            These cookies can share that information with other organizations,
            such as advertisers.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Specific Cookies We Use</h2>

          <div className="cookie-table-container">
            <table className="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>investo_session</td>
                  <td>Essential</td>
                  <td>Maintains your session state</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>auth_token</td>
                  <td>Essential</td>
                  <td>Authenticates logged-in users</td>
                  <td>30 days</td>
                </tr>
                <tr>
                  <td>language_pref</td>
                  <td>Preference</td>
                  <td>Stores language preferences</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>theme_mode</td>
                  <td>Preference</td>
                  <td>Remembers dark/light mode setting</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>_ga</td>
                  <td>Analytics</td>
                  <td>Google Analytics - Distinguishes users</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Analytics</td>
                  <td>Google Analytics - Counts page views</td>
                  <td>24 hours</td>
                </tr>
                <tr>
                  <td>invest_promo</td>
                  <td>Marketing</td>
                  <td>Tracks marketing campaign effectiveness</td>
                  <td>30 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their
            settings preferences. However, if you limit the ability of websites
            to set cookies, you may impact your overall user experience and
            certain functionalities of our website may not work properly.
          </p>

          <p>
            <strong>Browser Controls:</strong> You can set or amend your web
            browser controls to accept or refuse cookies. If you choose to
            reject cookies, you may still use our website though your access to
            some functionality and areas may be restricted.
          </p>

          <p>
            <strong>Our Cookie Management Tool:</strong> We provide a cookie
            management tool on our website that allows you to choose which types
            of cookies you accept or reject. You can access this tool by
            clicking "Cookie Settings" in the website footer.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Other Tracking Technologies</h2>
          <p>In addition to cookies, we use other similar technologies:</p>

          <p>
            <strong>Web Beacons:</strong> Small graphic images (also known as
            "pixel tags" or "clear GIFs") that may be included on our website
            and emails to learn how you interact with our website and
            communications.
          </p>

          <p>
            <strong>Local Storage Objects:</strong> We use technologies like
            local shared objects (also known as "Flash cookies") and local
            storage for browser features like IndexedDB to collect and store
            information about your preferences and navigation.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Updates to this Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect
            changes in technology, regulation, or our business practices. Any
            changes will become effective when we post the revised policy, and
            your continued use of our website following these changes means you
            accept the revised policy.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact
            us at:
          </p>
          <p>
            <strong>Email:</strong> cookies@investo.com
            <br />
            <strong>Address:</strong> 123 Investment Avenue, Finance District,
            54321
          </p>
        </section>
      </div>

      <div className="legal-footer">
        <div className="link-hover-effect">
          <Link to="/terms">Terms and Conditions</Link>
        </div>
        <div className="link-hover-effect">
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="link-hover-effect">
          <Link to="/">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
