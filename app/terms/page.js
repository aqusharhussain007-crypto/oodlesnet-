export const metadata = {
  title: "Terms & Conditions | OodlesNet",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Terms & Conditions</h1>

      <p>
        Welcome to <strong>OodlesNet</strong>. By accessing or using this
        website, you agree to be bound by the following Terms and Conditions.
        If you do not agree with any part of these terms, please do not use our
        website.
      </p>

      <h2>Website Purpose</h2>
      <p>
        OodlesNet is a price comparison and product discovery platform. We do
        not sell products directly. Prices, availability, and offers are
        provided by third-party sellers and may change at any time.
      </p>

      <h2>Accuracy of Information</h2>
      <p>
        While we strive to provide accurate and up-to-date information, we do
        not guarantee the completeness, reliability, or accuracy of product
        details, pricing, or availability.
      </p>

      <h2>Affiliate Disclaimer</h2>
      <p>
        OodlesNet participates in affiliate marketing programs. This means we
        may earn commissions from qualifying purchases made through links on
        this site. This does not influence product pricing or user experience.
      </p>

      <h2>User Responsibility</h2>
      <p>
        Users are responsible for verifying product details, pricing, and
        seller policies on the respective merchant websites before making any
        purchase.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on OodlesNet, including text, layout, logos, and design, is
        the property of OodlesNet unless otherwise stated. Unauthorized copying
        or reproduction is prohibited.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        OodlesNet shall not be held liable for any losses, damages, or disputes
        arising from the use of third-party websites or products linked from
        this platform.
      </p>

      <h2>External Links</h2>
      <p>
        Our website contains links to external sites that are not operated by
        us. We have no control over the content or practices of these sites and
        accept no responsibility for them.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to update or modify these Terms & Conditions at
        any time without prior notice. Continued use of the website after
        changes constitutes acceptance of the updated terms.
      </p>

      <h2>Contact Information</h2>
      <p>
        For any questions regarding these Terms & Conditions, please contact
        us at:
      </p>
      <p>
        <strong>Email:</strong> contact@oodlesnet.com
      </p>

      <p style={{ marginTop: 40, fontSize: 14, color: "#555" }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
  }
          
