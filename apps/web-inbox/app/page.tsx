import Link from 'next/link';
import { MessageSquare, Sparkles, Building2, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Vectra
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sign-in"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/sign-up"
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        >
                            Commencer
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Propulsé par Gemini AI</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
                        Unifiez vos conversations.
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Boostez vos ventes avec l'IA.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        La plateforme omnicanale pour centraliser WhatsApp, Email et plus encore.
                        <span className="font-semibold text-slate-700"> Une seule inbox pour toutes vos équipes.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/sign-up"
                            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
                        >
                            Commencer gratuitement
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/sign-in"
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300"
                        >
                            Voir la démo
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Configuration en 5 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Sans carte bancaire</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Support 24/7</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Une plateforme complète pour transformer votre relation client
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 - Omnichannel */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
                                <MessageSquare className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Omnicanal
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Connectez WhatsApp, Messenger et Email en un clic. Centralisez toutes vos conversations client.
                            </p>
                        </div>

                        {/* Feature 2 - AI Copilot */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                AI Copilot
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Répondez 10x plus vite grâce aux suggestions intelligentes de Gemini AI. Plus de réponses génériques.
                            </p>
                        </div>

                        {/* Feature 3 - Multi-Tenant */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Multi-Tenant
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Gérez plusieurs marques et équipes depuis un seul compte. Permissions et rôles personnalisés.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl shadow-blue-500/25">
                        <Zap className="h-12 w-12 text-white/80 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Prêt à transformer votre relation client ?
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                            Rejoignez des centaines d'entreprises qui utilisent Vectra pour booster leurs ventes.
                        </p>
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
                        >
                            Créer mon compte gratuit
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-slate-900">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">V</span>
                            </div>
                            <span className="font-bold text-lg text-white">Vectra</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400">
                            <Link href="/sign-in" className="hover:text-white transition-colors">Connexion</Link>
                            <Link href="/sign-up" className="hover:text-white transition-colors">Inscription</Link>
                            <span>|</span>
                            <span>© 2026 Vectra. Tous droits réservés.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
