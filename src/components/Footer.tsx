import React from "react";
import { Facebook, Instagram, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Rabee Academia" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-xl">Rabee Academia</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              A premium AI-powered educational platform delivering world-class tutoring for FSc, A/O Levels, BS & MS students.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1EazecLuwr/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/rabeeacademia?igsh=bDJiZjY5Y3R3Mmxp&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Programs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/quran-learning" className="hover:text-primary transition-colors">Quran Learning</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">FSc Pre-Medical</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">FSc Pre-Engineering</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">A/O Levels</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">BS Programs</a></li>
              <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Subjects</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/pricing" className="hover:text-primary transition-colors">Physics</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Chemistry</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Biology</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Mathematics</a></li>
              <li><a href="/products" className="hover:text-primary transition-colors">AI Tools</a></li>
              <li><a href="/#ai-mastery" className="hover:text-primary transition-colors">AI Mastery Course</a></li>
              <li><a href="/ai-career-stack" className="hover:text-primary transition-colors">AI Career Stack</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@rabeeacademia.site</li>
              <li>
                <a href="tel:+923086994758" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> 0308 6994758
                </a>
              </li>
              <li>Pakistan</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Copyright © 2026 Rabee Academia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
