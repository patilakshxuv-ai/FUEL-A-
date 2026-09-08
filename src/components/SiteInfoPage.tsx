import React from 'react';
import { ArrowLeft, Mail, ShieldCheck, FileText, Cookie, Info, ExternalLink } from 'lucide-react';
import { SEO_LANDING_PAGES } from '../data/seoLandingPages';

export type SitePageKey = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'cookies' | 'sitemap';

interface SiteInfoPageProps {
  page: SitePageKey;
  onBack: () => void;
}

const content: Record<SitePageKey, { title: string; intro: string }> = {
  about: {
    title: 'About FuelPath Pro',
    intro: 'FuelPath Pro is a practical web calculator for estimating vehicle fuel use, trip expense, mileage and recurring driving budgets.'
  },
  contact: {
    title: 'Contact FuelPath Pro',
    intro: 'For questions, corrections, partnership requests or feedback about FuelPath Pro, use the contact method provided by the site owner or publisher.'
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page explains the types of information that may be processed when you use FuelPath Pro and how local browser data and advertising technologies may work.'
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'By using FuelPath Pro, you agree to use the calculator responsibly and understand that estimates are informational rather than guarantees of actual vehicle expense.'
  },
  disclaimer: {
    title: 'Disclaimer',
    intro: 'FuelPath Pro provides estimates for planning purposes. Fuel prices, mileage, tolls, traffic and other costs can change, so verify important figures before travel.'
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'FuelPath Pro may use browser storage and third-party technologies to remember preferences, measure usage or display advertising where enabled.'
  },
  sitemap: {
    title: 'HTML Sitemap',
    intro: 'Browse the main calculator, guides and information pages available on FuelPath Pro.'
  }
};

const infoLinks: [string, SitePageKey][] = [
  ['About', 'about'], ['Contact', 'contact'], ['Privacy Policy', 'privacy'],
  ['Terms & Conditions', 'terms'], ['Disclaimer', 'disclaimer'], ['Cookie Policy', 'cookies'],
  ['HTML Sitemap', 'sitemap'],
];

export const SiteInfoPage: React.FC<SiteInfoPageProps> = ({ page, onBack }) => {
  const meta = content[page];
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black p-4 flex items-center justify-between gap-3">
        <button onClick={onBack} className="px-3 py-2 bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to FuelPath Pro
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">FuelPath Pro Information</span>
      </div>

      <article className="bg-white border-2 border-black p-6 sm:p-10 space-y-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#10B981] flex items-center justify-center">
            {page === 'privacy' ? <ShieldCheck className="w-5 h-5" /> :
             page === 'cookies' ? <Cookie className="w-5 h-5" /> :
             page === 'contact' ? <Mail className="w-5 h-5" /> :
             page === 'sitemap' ? <ExternalLink className="w-5 h-5" /> :
             page === 'about' ? <Info className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#059669]">Information Center</p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{meta.title}</h1>
          </div>
        </div>

        <p className="text-base text-slate-700 leading-7 max-w-4xl">{meta.intro}</p>

        {page === 'about' && (
          <>
            <Section title="What the calculator does">
              FuelPath Pro lets visitors estimate fuel quantity, fuel expense, tolls, parking, passenger splits, mileage scenarios and recurring commute budgets. Calculations are performed from the values entered by the visitor.
            </Section>
            <Section title="Our approach">
              We aim to present clear assumptions, editable inputs and practical explanations instead of presenting estimates as guaranteed prices or vehicle performance figures.
            </Section>
          </>
        )}

        {page === 'contact' && (
          <>
            <Section title="Feedback and corrections">
              If you notice an incorrect guide, broken link, outdated assumption or usability problem, please contact the site owner through the official contact channel associated with this website.
            </Section>
            <Section title="Business and partnership enquiries">
              Advertising, publishing and partnership enquiries should include the relevant page URL, a short description of the request and a preferred reply method.
            </Section>
          </>
        )}

        {page === 'privacy' && (
          <>
            <Section title="Information stored in your browser">
              Saved trips and calculator preferences may be stored locally in your browser. This local data is intended to make the calculator convenient and is not presented as a server-side account.
            </Section>
            <Section title="Advertising and third parties">
              If advertising is enabled, advertising partners may use cookies or similar technologies subject to their own policies and applicable consent requirements. Do not enter sensitive personal information into calculator fields.
            </Section>
            <Section title="Your choices">
              You can clear local browser storage through your browser settings. You can also use available cookie or advertising controls provided by your browser and advertising providers.
            </Section>
          </>
        )}

        {page === 'terms' && (
          <>
            <Section title="Use of estimates">
              FuelPath Pro calculations are estimates. You remain responsible for checking actual fuel prices, toll charges, road conditions, vehicle specifications and other travel information before making decisions.
            </Section>
            <Section title="Acceptable use">
              Do not attempt to disrupt the website, abuse automated requests, scrape protected services or use the calculator for unlawful activity.
            </Section>
          </>
        )}

        {page === 'disclaimer' && (
          <>
            <Section title="No guarantee of actual cost">
              Actual fuel consumption can differ because of vehicle condition, tyre pressure, traffic, weather, load, road gradient, driving style, fuel quality and route changes.
            </Section>
            <Section title="Prices and tolls">
              Fuel prices, toll rates, parking charges and exchange rates can change. Treat displayed examples as planning assumptions and verify current charges with the relevant provider before travel.
            </Section>
          </>
        )}

        {page === 'cookies' && (
          <>
            <Section title="What cookies are">
              Cookies are small browser files that can remember settings or support measurement and advertising. FuelPath Pro may also use browser storage for calculator features such as saved trips.
            </Section>
            <Section title="Managing cookies">
              Your browser normally lets you block, delete or restrict cookies. Blocking some technologies may affect advertising or optional site functionality.
            </Section>
          </>
        )}

        {page === 'sitemap' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {SEO_LANDING_PAGES.map((guide) => (
              <a key={guide.slug} href={`/guide/${guide.slug}`} className="border-2 border-black p-4 font-black text-sm hover:bg-black hover:text-white transition-colors">
                {guide.title}
              </a>
            ))}
            {infoLinks.map(([label, href]) => (
              <a key={href} href={`/${href}`} className="border-2 border-black p-4 font-black text-sm hover:bg-black hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
  <section className="border-t-2 border-slate-200 pt-5 space-y-2">
    <h2 className="text-lg font-black uppercase tracking-tight">{title}</h2>
    <p className="text-sm sm:text-base text-slate-600 leading-7">{children}</p>
  </section>
);
