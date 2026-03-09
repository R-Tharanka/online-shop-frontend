import React, { useState } from "react";

const CONTACT_API_BASE =
	import.meta.env.VITE_CONTACT_API_BASE || "http://localhost:3002/api/contact";

export default function ContactUs() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState({ type: "", message: "" });

	const updateField = (key) => (event) => {
		setForm((prev) => ({ ...prev, [key]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus({ type: "", message: "" });

		if (!form.name || !form.email || !form.subject || !form.message) {
			setStatus({ type: "error", message: "Please fill all required fields." });
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(CONTACT_API_BASE, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.message || "Failed to send message");
			}
			setStatus({ type: "success", message: "Message sent successfully." });
			setForm({ name: "", email: "", phone: "", subject: "", message: "" });
		} catch (error) {
			setStatus({ type: "error", message: error?.message || "Message failed" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(255,244,217,0.65),transparent_50%),radial-gradient(circle_at_85%_20%,rgba(220,230,255,0.7),transparent_55%),linear-gradient(120deg,#f9f7f4_0%,#f2f6ff_55%,#f8f1ff_100%)]">
			<div className="max-w-4xl mx-auto px-6 py-12">
				<div className="bg-white/90 backdrop-blur rounded-3xl border border-white/60 shadow-[0_30px_80px_rgba(26,0,46,0.14)] p-8 sm:p-10">
					<div className="flex flex-col gap-2">
						<p className="text-xs uppercase tracking-[0.32em] text-gray-400">Contact</p>
						<h1 className="text-3xl font-semibold text-[#1f1b2e]">Send us a message</h1>
						<p className="text-sm text-gray-500">
							Need help with an order or product? We will get back to you quickly.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="mt-8 grid gap-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<input
								type="text"
								placeholder="Full name *"
								value={form.name}
								onChange={updateField("name")}
								className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff]"
							/>
							<input
								type="email"
								placeholder="Email address *"
								value={form.email}
								onChange={updateField("email")}
								className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff]"
							/>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<input
								type="tel"
								placeholder="Phone (optional)"
								value={form.phone}
								onChange={updateField("phone")}
								className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff]"
							/>
							<input
								type="text"
								placeholder="Subject *"
								value={form.subject}
								onChange={updateField("subject")}
								className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff]"
							/>
						</div>
						<textarea
							rows={5}
							placeholder="Tell us how we can help *"
							value={form.message}
							onChange={updateField("message")}
							className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#1f1b2e] focus:ring-2 focus:ring-[#cfc2ff]"
						/>

						{status.message ? (
							<div
								className={`rounded-xl border px-4 py-3 text-xs ${
									status.type === "success"
										? "bg-emerald-50 border-emerald-200 text-emerald-700"
										: "bg-red-50 border-red-200 text-red-600"
								}`}
							>
								{status.message}
							</div>
						) : null}

						<button
							type="submit"
							disabled={loading}
							className="w-full sm:w-auto rounded-xl bg-[#1f1b2e] text-white px-6 py-3 text-sm font-semibold hover:bg-[#2c2740] transition disabled:opacity-60"
						>
							{loading ? "Sending..." : "Send message"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
