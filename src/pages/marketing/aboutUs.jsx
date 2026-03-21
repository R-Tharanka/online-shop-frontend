import { Link } from 'react-router-dom';

const highlights = [
	{
		title: 'Quality First',
		description:
			'Every item is selected and tested for durability, comfort, and detail so your purchase feels worth it from day one.',
	},
	{
		title: 'Thoughtful Support',
		description:
			'Our support team helps with sizing, product guidance, and order updates with real humans who respond fast.',
	},
	{
		title: 'Simple Experience',
		description:
			'From clean browsing to smooth checkout, we remove friction so your shopping flow feels effortless.',
	},
];

export default function AboutUs() {
	return (
		<main className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-[#FBFBFB] to-[#E8F9FF]">
			<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
				<div className="rounded-3xl border border-[#8200db33] bg-white/90 shadow-xl p-6 md:p-10">
					<p className="inline-flex rounded-full px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase text-white bg-[#8200db]">
						About Veloura
					</p>
					<h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-tight text-slate-900">
						Built to make everyday style feel premium, practical, and personal.
					</h1>
					<p className="mt-5 max-w-3xl text-base md:text-lg text-slate-600 leading-relaxed">
						Veloura was created for people who want high-quality fashion essentials without the stress of endless searching.
						We combine clean design, reliable quality, and customer-first support to deliver a better shopping experience.
					</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							to="/orders"
							className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
							style={{ background: 'linear-gradient(135deg, #8200db, #a855f7)' }}
						>
							Explore Collection
						</Link>
						<Link
							to="/contact"
							className="px-6 py-3 rounded-full text-sm font-semibold border border-[#8200db44] text-[#8200db] bg-white hover:bg-[#8200db12] transition-colors duration-300"
						>
							Contact Team
						</Link>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-10">
					{highlights.map((item) => (
						<article
							key={item.title}
							className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
						>
							<h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
							<p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{item.description}</p>
						</article>
					))}
				</div>

				<section className="mt-10 rounded-3xl p-6 md:p-8 bg-[#8200db] text-white shadow-xl">
					<h3 className="text-xl md:text-2xl font-bold">Our Promise</h3>
					<p className="mt-3 text-sm md:text-base text-white/90 max-w-3xl leading-relaxed">
						We are committed to honest pricing, trusted product quality, and a shopping experience that respects your time.
						If something is not right, we fix it quickly.
					</p>
				</section>
			</section>
		</main>
	);
}
