import { FiMapPin, FiPhone, FiMail, FiClock, FiInfo } from "react-icons/fi";
import ContactForm from "./ContactForm";

export default function ContactUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-sgu-navy mb-4">
          How Are We Doing?
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-sgu-navy mb-6">
          Our Team Is Here To Help.
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          If you have a question about an order, our products, or want to leave
          a comment, complaint, or feedback, please send it to us and a
          representative will follow up with you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column - Contact Info */}
        <div className="flex flex-col gap-8">
          <h3 className="text-3xl font-black text-sgu-navy pb-4 border-b-2 border-slate-100">
            Contact Information
          </h3>

          <div className="flex flex-col gap-8">
            {/* Address */}
            <div className="flex items-start gap-5">
              <div className="mt-1 p-3.5 bg-sgu-navy/5 rounded-2xl text-sgu-navy">
                <FiMapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 pb-8 border-b border-slate-100">
                <h4 className="font-bold text-sgu-navy text-xl mb-2">
                  SGU Campus Store
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  St. George&apos;s University
                  <br />
                  University Centre
                  <br />
                  Grenada, West Indies
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-5">
              <div className="mt-1 p-3.5 bg-sgu-turquoise/10 rounded-2xl text-sgu-turquoise">
                <FiPhone className="w-6 h-6" />
              </div>
              <div className="flex-1 pb-8 border-b border-slate-100">
                <h4 className="font-bold text-sgu-navy text-xl mb-2">
                  Phone Numbers
                </h4>
                <div className="flex flex-col gap-2 text-slate-600">
                  <p>
                    <span className="font-bold text-sgu-navy mr-2">
                      Store Support:
                    </span>
                    1 800-899-6337
                  </p>
                  <p>
                    <span className="font-bold text-sgu-navy mr-2">
                      Local (Grenada):
                    </span>
                    +1 (473) 444-1770
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-5">
              <div className="mt-1 p-3.5 bg-sgu-navy/5 rounded-2xl text-sgu-navy">
                <FiMail className="w-6 h-6" />
              </div>
              <div className="flex-1 pb-8 border-b border-slate-100">
                <h4 className="font-bold text-sgu-navy text-xl mb-2">
                  Email Us
                </h4>
                <a
                  href="mailto:campusstore@sgu.edu"
                  className="text-sgu-turquoise hover:text-sgu-navy font-bold transition-colors text-lg"
                >
                  campusstore@sgu.edu
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-5">
              <div className="mt-1 p-3.5 bg-sgu-turquoise/10 rounded-2xl text-sgu-turquoise">
                <FiClock className="w-6 h-6" />
              </div>
              <div className="flex-1 pb-8 border-b border-slate-100">
                <h4 className="font-bold text-sgu-navy text-xl mb-2">
                  Hours of Operation
                </h4>
                <div className="flex flex-col gap-2 text-slate-600">
                  <p>
                    <span className="font-bold text-sgu-navy mr-2">
                      Monday - Friday:
                    </span>
                    8:00 AM - 5:00 PM AST
                  </p>
                  <p>
                    <span className="font-bold text-sgu-navy mr-2">
                      Saturday - Sunday:
                    </span>
                    Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Returns Info */}
            <div className="flex items-start gap-5">
              <div className="mt-1 p-3.5 bg-sgu-orange/10 rounded-2xl text-sgu-orange">
                <FiInfo className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sgu-navy text-xl mb-2">
                  Returns & Exchanges
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Most items can be returned within 30 days of receipt. Please
                  ensure items are in their original condition with tags
                  attached. For damaged items or order discrepancies, please
                  contact us within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 h-fit">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
