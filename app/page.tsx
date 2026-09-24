import About from "@/components/about";
import Contact from "@/components/contact";
import Hero from "@/components/hero";
import HomeShell from "@/components/home-shell";
import Projects from "@/components/projects";
import TechStack from "@/components/stacks";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1020] to-[#071024] text-[#e6eef8] overflow-x-hidden">
      <HomeShell>
        <main className="relative z-10 mx-auto max-w-[1100px] px-10">
          <Hero />
          <TechStack />
          <Projects />
          <About />
          <Contact />
          <footer className="py-10 text-center text-[#9aa4b2]">
            © Wallysson Sousa · Portfólio Pessoal.
          </footer>
        </main>
      </HomeShell>
    </div>
  );
}
