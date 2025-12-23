import React, { useState } from "react";

// Helper function to sanitize user inputs
const sanitizeInput = (input: string) => {
  return input
    .replace(/[<>&"']/g, (match) => {
      const map: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[match];
    })
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", query: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Allow normal typing, sanitize only on submit
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double validation before sending
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      query: sanitizeInput(formData.query),
    };

    // Basic validation
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.query) {
      alert("Please fill out all fields properly.");
      return;
    }

    // Email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitizedData.email)) {
      alert("Invalid email address format.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/email/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add CSRF protection header if your backend supports it
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        alert("Your message has been sent securely!");
        setFormData({ name: "", email: "", query: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8 text-gray-900 dark:text-white space-y-6"
      >
        <div className="relative">
          <h2 className="text-3xl font-semibold textbg  -[#202938] dark:bg-[#202938] pl-8">Contact Us</h2>
          <span className="absolute top-2 left-0 w-4 h-4 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse"></span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Have a question or feedback? Fill out the form below and we’ll get back to you.
        </p>

        <label className="relative block">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder=" "
            className="peer w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pt-5 pb-2 text-gray-900 dark:text-white outline-none focus:border-sky-500"
          />
          <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sky-500 pointer-events-none">
            Your Name
          </span>
        </label>

        <label className="relative block">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder=" "
            className="peer w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pt-5 pb-2 text-gray-900 dark:text-white outline-none focus:border-sky-500"
          />
          <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sky-500">
            Your Email
          </span>
        </label>

        <label className="relative block">
          <textarea
            name="query"
            value={formData.query}
            onChange={handleChange}
            required
            placeholder=" "
            rows={4}
            className="peer w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 pt-5 pb-2 text-gray-900 dark:text-white outline-none resize-none focus:border-sky-500"
          />
          <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sky-500">
            Your Message
          </span>
        </label>

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 transition-colors text-white font-semibold py-3 rounded-lg shadow-md"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
