import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar_frame from "../Common frames/Navbar_frame";
import gsap from "gsap";
import Footer_frame from "../Common frames/Footer_frame";

gsap.registerPlugin(ScrollTrigger)

const About = () => {

  useGSAP(()=>{
    gsap.from(".about_p_1",{
      y:100,
      duration:1,
    })
    gsap.from(".ap_1_text",{
      x:-100,
      duration:1,
    })
    gsap.from(".about_p_1_img",{
      x:100,
      duration:1,
    })

    gsap.from(".ap_2_cont",{
      y:100,
      duration:1,
      scrollTrigger:{
        trigger:".ap_2_cont",
        start: "top 100%",
        end: "top 0%",
        scrub:2,
      }
    })
  
    gsap.from(".ap_2_elem_div",{
      y:100,
      duration:1.3,
      scrollTrigger:{
        trigger:".ap_2_cont",
        start: "top 100%",
        end: "top 0%",
        scrub:2,
      }
    })
  

    
  })

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen text-gray-800">
      <div className="Navbar_frame sticky top-0 z-50 bg-white shadow-md">
        <Navbar_frame />
      </div>

    

      <section className="about_p_1 h-[90vh]  max-w-7xl mx-auto px-6 py-16">
        <div className=" text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">About Trendify</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Revolutionizing the fashion industry with AI-powered e-commerce experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="ap_1_text space-y-6">
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
            className="about_p_1_img rounded-2xl shadow-lg object-cover max-h-[450px] w-full"
          />
        </div>
      </section>

      <section className="ap_2_cont bg-blue-100 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">What Powers Trendify?</h2>
          <div className="ap_2_elem_div grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
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
        <div className="footer_frame_ mt-10">
                <Footer_frame />
            </div>

      </section>
    </div>
  );
};

export default About;
