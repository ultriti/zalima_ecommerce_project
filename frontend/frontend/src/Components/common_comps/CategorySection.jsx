import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import '../../index.css';
const CategorySection = ({ title, products = [] }) => (
  <section className="my-10 px-4 md:px-10">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800 capitalize">{title}</h2>
      <Link
        to={`/category/${title}`}
        className="text-blue-600 hover:underline text-sm font-medium"
      >
        View All
      </Link>
    </div>

    <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400">
      {products.map((product) => (
        <div className="min-w-[180px] max-w-[200px]" key={product._id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </section>
);

export default CategorySection;
