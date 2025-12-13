import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';



export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        <section className="section-padding">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Welcome to <span className="gradient-text">N</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Build an app
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
                Get Started
              </button>
              <button type="button" className="px-6 py-3 border border-border hover:bg-surface-hover text-text font-medium rounded-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
}