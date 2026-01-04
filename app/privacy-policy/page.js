export const metadata = {
  title: "Privacy Policy | OodlesNet",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Privacy Policy</h1>

      <p>
        At <strong>OodlesNet</strong>, your privacy is important to us. This
        Privacy Policy document explains how we collect, use, and protect your
        information when you use our website.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We do not require users to create accounts or provide personal
        information to browse OodlesNet. However, we may collect limited data
        automatically, such as:
      </p>
      <ul>
        <li>Device type and browser information</li>
        <li>Pages visited and interaction data</li>
        <li>Referral source (e.g., search engine or link)</li>
      </ul>

      <h2>Affiliate Links</h2>
      <p>
        OodlesNet contains affiliate links to third-party e-commerce websites
        such as Amazon, Flipkart, Meesho, Ajio, and others. When you click on
        these links, you are redirected to external websites that operate under
        their own privacy policies.
      </p>
      <p>
        We may earn a commission if you make a purchase through these links, at
        no additional cost to you.
      </p>

      <h2>Cookies</h2>
      <p>
        Third-party partners may use cookies or similar technologies to track
        conversions and improve their services. OodlesNet itself does not use
        cookies to collect personally identifiable information.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        We are not responsible for the privacy practices or content of external
        websites linked from OodlesNet. We encourage users to review the privacy
        policies of those websites.
      </p>

      <h2>Data Security</h2>
      <p>
        We take reasonable measures to protect the information available to us,
        but no method of transmission over the internet is 100% secure.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be
        posted on this page with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, you can contact us
        at:
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
          
