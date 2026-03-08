import { useMemo, useState } from 'react';

const initialForm = {
	name: '',
	email: '',
	phone: '',
	subject: '',
	message: '',
};

const CONTACT_API_URL = 'http://localhost:3002/api/contact';

export default function ContactUs() {
	const [formData, setFormData] = useState(initialForm);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [submitSuccess, setSubmitSuccess] = useState('');

	const canSubmit = useMemo(() => {
		return (
			formData.name.trim() &&
			formData.email.trim() &&
			formData.subject.trim() &&
			formData.message.trim()
		);
	}, [formData]);

	function handleChange(event) {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setSubmitError('');
		setSubmitSuccess('');

		if (!canSubmit) {
			setSubmitError('Please fill all required fields.');
			return;
		}

		setIsSubmitting(true);

		try {
			const payload = {
				id: Date.now(),
				name: formData.name.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				subject: formData.subject.trim(),
				message: formData.message.trim(),
			};

			const response = await fetch(CONTACT_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			setSubmitSuccess('Message sent successfully. Our team will contact you soon.');
			setFormData(initialForm);
		} catch (error) {
			setSubmitError(
				'Unable to send your message right now. Please verify the backend is running at http://localhost:3002/api/contact.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-[#FBFBFB] to-[#E8F9FF] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
			<section className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-6 md:gap-8">
				<article className="rounded-3xl bg-white border border-[#8200db22] shadow-sm p-6 md:p-8">
					<p className="inline-flex rounded-full px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase text-white bg-[#8200db]">
						Contact Us
					</p>
					<h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
						We are here to help you quickly and clearly.
					</h1>
					<p className="mt-4 text-slate-600 leading-relaxed">
						Share your question, feedback, or support request. The Veloura team reviews each message and responds as fast as possible.
					</p>

					<div className="mt-8 space-y-4 text-sm">
						<div className="rounded-2xl bg-[#E8F9FF] p-4 border border-slate-200">
							<p className="font-semibold text-slate-900">Fast Responses</p>
							<p className="text-slate-600 mt-1">Most messages receive a response within one business day.</p>
						</div>
						<div className="rounded-2xl bg-[#E8F9FF] p-4 border border-slate-200">
							<p className="font-semibold text-slate-900">Order Support</p>
							<p className="text-slate-600 mt-1">Need order help? Include your order details in the subject line.</p>
						</div>
					</div>
				</article>

				<form
					onSubmit={handleSubmit}
					className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 md:p-8"
				>
					<h2 className="text-2xl font-bold text-slate-900">Send a Message</h2>
					<p className="mt-2 text-sm text-slate-600">Fields marked with * are required.</p>

					<div className="mt-6 grid sm:grid-cols-2 gap-4">
						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
							Name *
							<input
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Your name"
								required
								className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8200db66]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
							Email *
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="name@example.com"
								required
								className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8200db66]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
							Phone (Optional)
							<input
								type="tel"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								placeholder="+94 71 234 5678"
								className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8200db66]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
							Subject *
							<input
								name="subject"
								value={formData.subject}
								onChange={handleChange}
								placeholder="How can we help?"
								required
								className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8200db66]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
							Message *
							<textarea
								name="message"
								value={formData.message}
								onChange={handleChange}
								placeholder="Write your message..."
								required
								rows={5}
								className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none resize-y focus:ring-2 focus:ring-[#8200db66]"
							/>
						</label>
					</div>

					{submitError ? (
						<p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
					) : null}

					{submitSuccess ? (
						<p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
							{submitSuccess}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting || !canSubmit}
						className="mt-6 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
						style={{ background: 'linear-gradient(135deg, #8200db, #a855f7)' }}
					>
						{isSubmitting ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</section>
		</main>
	);
}
