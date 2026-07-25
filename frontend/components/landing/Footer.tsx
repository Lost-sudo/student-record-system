import Link from "next/link";
import Logo from "@/components/ui/Logo";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Resources: ["Documentation", "API Reference", "Case Studies", "Blog"],
  Company: ["About", "Careers", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="text-sm text-slate-500 mt-4">The next generation of student record management.</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-800 mb-4">{category}</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-indigo-600 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-100 mt-10 pt-8 text-center text-sm text-slate-400">
          © 2024 NexusSRS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}