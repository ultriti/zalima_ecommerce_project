import { useGSAP } from "@gsap/react";
import Navbar_frame from "../Common frames/Navbar_frame";
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger)


const About = () => {

  useGSAP(() => {
    gsap.from(".AP_title", {
      duration: 1,
      opacity: 1,
      y: 100,
    })
    gsap.from(".AP_desc", {
      duration: 1,
      opacity: 1,
      y: 100,
    })
    gsap.from(".ap_pg1_frame",{
      duration: 1,
      opacity: 1,
      y: 100,
    })
    gsap.from(".ap_pg_1_comp",{
      duration: 1,
      opacity: 1,
      x: -100,
    })
    gsap.from(".ap_pg1_comp_img",{
      duration: 1,
      opacity: 1,
      x: 100,
    })
    gsap.from(".ap_pg2_frame",{
      duration: 1,
      opacity: 1,
      y:150,
      scrollTrigger:{
        trigger: ".pg2_frame",
        start:"top 100%",
        end:"1op 0%",
        scrub:1,
      }
    })
  })


  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-[100vh] text-gray-800">
      <div className="Navbar_frame sticky top-0 z-50 bg-white shadow-md">
        <Navbar_frame />
      </div>

      <section className="max-w-7xl mx-auto px-6 py-16 min-h-[100vh]">
        <div className="text-center mb-12">
          <h1 className="AP_title text-4xl font-bold text-blue-700 mb-4">About Trendify</h1>
          <p className="AP_desc text-lg text-gray-600 max-w-2xl mx-auto">
            Revolutionizing the fashion industry with AI-powered e-commerce experiences.
          </p>
        </div>

        <div className="ap_pg1_frame grid md:grid-cols-2 gap-10 items-center">
          <div className="ap_pg_1_comp space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At <strong>Trendify</strong>, we're redefining how fashion meets technology. Our mission is
              to deliver a personalized, secure, and seamless shopping experience using AI and modern web technologies.
            </p>

            <h2 className="text-2xl font-semibold text-blue-600">Why Trendify?</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Smart recommendations powered by machine learning.</li>
              <li>Secure and intuitive checkout system with multiple payment options.</li>
              <li>Real-time reviews, delivery tracking, and personalized styling tips.</li>
              <li>Inspired by platforms like <i>Bewakoof</i> and <i>The Souled Store</i>.</li>
            </ul>
          </div>

          <img
            src="../../../public/images/6505894.jpg"
            alt="Trendify Shopping AI"
            className="ap_pg1_comp_img rounded-2xl shadow-lg object-cover max-h-[450px] w-full"
          />
        </div>
      </section>

      <section className="pg2_frame min-h-[100vh] overflow-hidden bg-blue-100 py-14">
        <div className="ap_pg2_frame max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">What Powers Trendify?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {[
              { title: 'MERN Stack', desc: 'Built with MongoDB, Express, React, and Node.js for scalable development.' },
              { title: 'AI & ML', desc: 'Integrated TensorFlow.js & Google Vision for smart search & outfit recommendations.' },
              { title: 'Secure Auth', desc: 'OAuth 2.0 and JWT for safe and flexible user authentication.' },
              { title: 'Payment Integration', desc: 'Supports Razorpay, Stripe, PayPal, and Buy Now Pay Later (BNPL).' },
              { title: 'Admin Dashboard', desc: 'Manage products, orders, users & analytics with a beautiful React dashboard.' },
              { title: 'Cloud Ready', desc: 'Hosted on AWS with CDN caching and performance optimizations.' }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300"
              >
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Join Our Journey</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Whether you're a trendsetter or a tech enthusiast, Trendify is for you. Explore our platform, shop your vibe, and experience the future of online fashion.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition shadow-lg">
            <a href='/'>Explore Products</a>
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
