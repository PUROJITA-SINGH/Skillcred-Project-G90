# Social Donation Website 💖

A modern, one-page social donation website designed to make the donation process seamless and impactful. This project integrates a **headless CMS** for flexible content management, **Stripe** for secure payments, and a **Large Language Model (LLM)** to provide a personalized and meaningful donor experience.

✨ Features

  * **Single-Page Design:** A clean, intuitive, and focused user interface for a quick and simple donation process, built with **HTML** and **Tailwind CSS**.
  * **Headless CMS Integration:** The donation campaign data is designed to be pulled from a headless CMS, allowing for easy updates without touching the codebase.
  * **Secure Payments with Stripe:** Process donations securely and reliably using the Stripe API. The payment form is integrated directly into the page.
  * **Personalized Donor Communication:** After a successful donation, a backend process (not included in the frontend code) leverages an LLM to automatically generate a personalized thank you email and an impact summary, which is then sent to the donor.
  * **Interactive Impact Meter:** A dynamic visual meter updates in real-time to show the donor the direct impact of their contribution.
  * **Responsive UI:** The design is fully responsive and optimized for a seamless experience on both desktop and mobile devices.

💻 Technologies Used

  * **Frontend:** HTML, JavaScript (for client-side logic), Tailwind CSS (for styling).
  * **Payment Processing:** Stripe JS v3 for a secure card element.
  * **Content Management:** Designed to be integrated with a **Headless CMS** (e.g., Sanity, Contentful, Strapi).
  * **LLM Integration:** This project's backend logic (not provided in this repository) uses a **Large Language Model** (e.g., Google's PaLM, OpenAI's GPT-3/4) to generate personalized emails and impact summaries.

🚀 Getting Started

Follow these steps to get a local copy of the project up and running for development and testing.

😎 Prerequisites

You will need the following to run and test the payment functionality:

  * A **Stripe** account and a **publishable key** (for the frontend).
  * A backend server configured to handle the payment intent creation and webhook events from Stripe. This repository only contains the frontend code.
  * An API endpoint for your LLM and an email service (like SendGrid or Mailgun) to handle the post-donation communication.

🖥️ Installation

This is a single-page HTML file, so there are no build steps required for the frontend.

1.  Clone the repository:
    ```bash
    git clone https://github.com/PUROJITA-SINGH/Skillcred-Project-G90.git
    cd SocialDonationWebsite
    ```
2.  Open the `index.html` file directly in your web browser.


 📄 Code Structure

The entire project is contained within a single `index.html` file for simplicity.

  * The `<head>` section includes **Tailwind CSS** and **Stripe.js** from their CDNs, as well as a custom `<style>` block for specific animations and effects.
  * The `<body>` contains two main sections (`div`s with `id="homepage"` and `id="donate"`) that are toggled for the single-page application feel.
  * The `<script>` block at the bottom handles all the client-side logic, including page navigation, donation amount selection, and the interaction with the Stripe payment form.


😊Thank You!
