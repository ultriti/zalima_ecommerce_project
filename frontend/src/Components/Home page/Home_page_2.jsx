import React from 'react';
import './Home_page_2.css';
import Homepage2_templates from './Homepage2_templates';

const categories = [
  { name: 'Men', key: 'men' },
  { name: 'Women', key: 'women' },
  { name: 'Girls', key: 'girl' },
  { name: 'Boys', key: 'boy' },
  { name: 'Wedding', key: 'Wedding' },
];

const Home_page_2 = () => {
  return (
    <div className="home_page_2_frame w-full flex flex-col bg-gray-100">
      <div className="homepage_2_container px-4">
        {categories.map((category) => (
          <div
            key={category.key}
            className="hp_2_swipper_frame h-[69vh] my-6 w-full rounded-2xl shadow-lg"
          >
            <div className="bg-gray-200 hp_2_swipper_title h-12 m-1 flex items-center justify-between rounded-lg w-[99%] px-5">
              <p className="text-gray-800 font-bold text-lg uppercase md:text-xl">
                {category.name}
              </p>
              <a
                href="/products/allProducts"
                className="font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                See More
              </a>
            </div>
            <Homepage2_templates category={category.key} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home_page_2;