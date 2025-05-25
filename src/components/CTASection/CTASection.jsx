import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "../../utils/icons";

/**
 * Call to Action Section component
 */
const CTASection = () => {
  return (
    <section className="cta-section-home">
      <div className="cta-content-home">
        <h2 className="cta-title-home">Ready to start investing?</h2>
        <p className="cta-description-home">
          Join thousands of investors and start earning daily profits on your
          crypto assets. With our secure platform, you can invest with
          confidence.
        </p>

        <div className="cta-actions-home">
          <Link href="/invest" className="cta-button-home primary">
            <span>Investment Plans</span>
            <ChevronRightIcon size={20} />
          </Link>

          <Link href="/dashboard" className="cta-button-home secondary">
            <span>View Dashboard</span>
            <ChevronRightIcon size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

// CSS for CTA Section
document.head.appendChild(document.createElement("style")).textContent = `
.cta-section-home {
  margin: 4rem 0;
  padding: 3rem 1.5rem;
  background: var(--gradient-cta-bg);
  border-radius: 1.5rem;
  position: relative;
  overflow: hidden;
}

.cta-content-home {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-title-home {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cta-description-home {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions-home {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.cta-button-home {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  gap: 0.5rem;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
  width: 100%;
  max-width: 250px;
}

.cta-button-home.primary {
  background: var(--gradient-button);
  color: white;
  border: none;
}

.cta-button-home.secondary {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cta-button-home:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.cta-button-home svg {
  transition: transform var(--transition-fast);
}

.cta-button-home:hover svg {
  transform: translateX(3px);
}

@media (min-width: 640px) {
  .cta-actions-home {
    flex-direction: row;
  }
}
`;
