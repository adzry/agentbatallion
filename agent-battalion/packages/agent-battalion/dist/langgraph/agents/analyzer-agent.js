/**
 * Analyzer Agent
 *
 * Responsible for analyzing user requirements and extracting structured
 * specifications for the app to be generated.
 */
import { BaseAgent } from '../base-agent.js';
export class AnalyzerAgent extends BaseAgent {
    constructor() {
        super('analyzer', 'Analyzes user requirements and extracts specifications');
    }
    getSystemPrompt() {
        return `You are an expert software architect and requirements analyst.
Your job is to analyze user requests for web applications and extract:

1. **Functional Requirements**: What the app should do
2. **Components**: UI components needed (pages, layouts, widgets)
3. **Data Models**: Data structures and relationships
4. **Routes**: URL structure and navigation
5. **Features**: Key features prioritized by importance

Always provide structured, actionable specifications that can be used
to generate a complete application.

Focus on modern web development best practices:
- React/Next.js component patterns
- TypeScript for type safety
- Tailwind CSS for styling
- Server/Client component separation
- SEO and accessibility considerations`;
    }
    async execute(input) {
        const { prompt, config } = input;
        // Extract structured data from the prompt
        const requirements = this.extractRequirements(prompt);
        const components = this.extractComponents(prompt);
        const dataModels = this.extractDataModels(prompt);
        const routes = this.extractRoutes(prompt);
        const features = this.extractFeatures(prompt);
        return {
            requirements,
            components,
            dataModels,
            routes,
            features,
        };
    }
    extractRequirements(prompt) {
        const requirements = [];
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('landing')) {
            requirements.push('Landing page with hero section');
        }
        if (lowerPrompt.includes('portfolio')) {
            requirements.push('Portfolio showcase section');
        }
        if (lowerPrompt.includes('dashboard')) {
            requirements.push('Admin dashboard with data visualization');
        }
        if (lowerPrompt.includes('blog')) {
            requirements.push('Blog with posts and categories');
        }
        if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('store')) {
            requirements.push('E-commerce functionality with cart');
        }
        if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) {
            requirements.push('User authentication system');
        }
        // Default requirements
        requirements.push('Responsive design');
        requirements.push('Modern UI with Tailwind CSS');
        requirements.push('TypeScript support');
        return requirements;
    }
    extractComponents(prompt) {
        const components = [
            {
                name: 'Layout',
                type: 'layout',
                description: 'Root layout with header and footer',
            },
            {
                name: 'Header',
                type: 'component',
                description: 'Navigation header',
            },
            {
                name: 'Footer',
                type: 'component',
                description: 'Site footer',
            },
            {
                name: 'HomePage',
                type: 'page',
                description: 'Main landing page',
            },
        ];
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('hero')) {
            components.push({
                name: 'HeroSection',
                type: 'component',
                description: 'Hero section with CTA',
            });
        }
        if (lowerPrompt.includes('feature')) {
            components.push({
                name: 'FeatureCard',
                type: 'component',
                description: 'Feature display card',
            });
        }
        if (lowerPrompt.includes('contact')) {
            components.push({
                name: 'ContactForm',
                type: 'component',
                description: 'Contact form component',
            });
        }
        if (lowerPrompt.includes('testimonial')) {
            components.push({
                name: 'TestimonialCard',
                type: 'component',
                description: 'Customer testimonial card',
            });
        }
        return components;
    }
    extractDataModels(prompt) {
        const models = [];
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('blog') || lowerPrompt.includes('post')) {
            models.push({
                name: 'Post',
                fields: [
                    { name: 'id', type: 'string', required: true, unique: true },
                    { name: 'title', type: 'string', required: true },
                    { name: 'content', type: 'string', required: true },
                    { name: 'slug', type: 'string', required: true, unique: true },
                    { name: 'createdAt', type: 'Date', required: true },
                    { name: 'updatedAt', type: 'Date', required: true },
                ],
            });
        }
        if (lowerPrompt.includes('user') || lowerPrompt.includes('auth')) {
            models.push({
                name: 'User',
                fields: [
                    { name: 'id', type: 'string', required: true, unique: true },
                    { name: 'email', type: 'string', required: true, unique: true },
                    { name: 'name', type: 'string', required: true },
                    { name: 'createdAt', type: 'Date', required: true },
                ],
            });
        }
        if (lowerPrompt.includes('product') || lowerPrompt.includes('ecommerce')) {
            models.push({
                name: 'Product',
                fields: [
                    { name: 'id', type: 'string', required: true, unique: true },
                    { name: 'name', type: 'string', required: true },
                    { name: 'description', type: 'string', required: true },
                    { name: 'price', type: 'number', required: true },
                    { name: 'image', type: 'string', required: false },
                ],
            });
        }
        return models;
    }
    extractRoutes(prompt) {
        const routes = [
            { path: '/', component: 'HomePage', layout: 'Layout' },
        ];
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('about')) {
            routes.push({ path: '/about', component: 'AboutPage', layout: 'Layout' });
        }
        if (lowerPrompt.includes('contact')) {
            routes.push({ path: '/contact', component: 'ContactPage', layout: 'Layout' });
        }
        if (lowerPrompt.includes('blog')) {
            routes.push({ path: '/blog', component: 'BlogPage', layout: 'Layout' });
            routes.push({ path: '/blog/[slug]', component: 'BlogPostPage', layout: 'Layout' });
        }
        if (lowerPrompt.includes('dashboard')) {
            routes.push({ path: '/dashboard', component: 'DashboardPage', layout: 'Layout' });
        }
        if (lowerPrompt.includes('pricing')) {
            routes.push({ path: '/pricing', component: 'PricingPage', layout: 'Layout' });
        }
        return routes;
    }
    extractFeatures(prompt) {
        const features = [];
        const lowerPrompt = prompt.toLowerCase();
        features.push({
            name: 'Responsive Design',
            description: 'Mobile-first responsive layout',
            priority: 'high',
            components: ['Layout', 'Header'],
        });
        features.push({
            name: 'Dark Theme',
            description: 'Dark color scheme',
            priority: 'high',
            components: ['Layout'],
        });
        if (lowerPrompt.includes('animation')) {
            features.push({
                name: 'Animations',
                description: 'Smooth animations and transitions',
                priority: 'medium',
                components: ['HeroSection', 'FeatureCard'],
            });
        }
        if (lowerPrompt.includes('seo')) {
            features.push({
                name: 'SEO Optimization',
                description: 'Meta tags, Open Graph, structured data',
                priority: 'high',
                components: ['Layout'],
            });
        }
        return features;
    }
}
/**
 * Run the analyzer agent
 */
export async function runAnalyzerAgent(prompt, config) {
    const agent = new AnalyzerAgent();
    const result = await agent.run({ prompt, config });
    return result;
}
//# sourceMappingURL=analyzer-agent.js.map