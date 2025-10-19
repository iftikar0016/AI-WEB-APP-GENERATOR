export default function FeaturesCard() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Features</h2>
      </div>
      <ul className="space-y-3 text-gray-700 dark:text-gray-300">
        <FeatureItem text="AI-powered HTML/CSS/JavaScript generation" />
        <FeatureItem text="Automatic GitHub repository creation" />
        <FeatureItem text="GitHub Pages deployment" />
        <FeatureItem text="Iterative improvements (Round 1 & 2)" />
        <FeatureItem text="Professional README and MIT License" />
      </ul>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start">
      <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
      <span>{text}</span>
    </li>
  );
}
