import { useNavigate } from 'react-router-dom';
import '../../index.css';
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition p-4 flex flex-col"
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-40 object-contain mb-3"
      />
      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mt-1">${product.price}</p>
      <div className="text-yellow-500 text-sm mt-1">
        {'★'.repeat(Math.round(product.rating || 4))}
        {'☆'.repeat(5 - Math.round(product.rating || 4))}
      </div>
    </div>
  );
};

export default ProductCard;
