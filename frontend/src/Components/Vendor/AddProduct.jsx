import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar_frame from '../Common frames/Navbar_frame';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    countInStock: '',
    brand: '',
    material: '',
    careInstructions: '',
    fit: '',
    season: '',
    gender: '',
    ageGroup: '',
    tags: [],
    sizes: [{ size: '', stock: 0 }],
    colors: [{ color: '', colorCode: '', stock: 0, images: [] }],
    images: [],
    discount: 0,
  });
  const [tagsInput, setTagsInput] = useState('');

  const categories = [
    'men-shirts', 'men-pants', 'men-jackets', 'men-t-shirts', 'men-jeans', 'men-formal',
    'women-dresses', 'women-tops', 'women-pants', 'women-skirts', 'women-jackets', 'women-jeans', 'women-formal',
    'kids-boys', 'kids-girls', 'accessories', 'shoes', 'bags'
  ];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'];
  const fits = ['slim', 'regular', 'loose', 'oversized', 'tailored'];
  const seasons = ['spring', 'summer', 'autumn', 'winter', 'all-season'];
  const genders = ['men', 'women', 'unisex', 'kids'];
  const ageGroups = ['adult', 'teen', 'kids', 'toddler', 'infant'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      toast.error('Please log in to add products');
      navigate('/user/signin');
      return;
    }

    if (userRole !== 'vendor') {
      toast.error('You do not have vendor privileges');
      navigate('/unauthorized');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
  };

  const handleImageUpload = (e, colorIndex = null) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(new Error(`Failed to read file: ${err}`));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(images => {
        if (colorIndex !== null) {
          const updatedColors = [...formData.colors];
          updatedColors[colorIndex].images = [...updatedColors[colorIndex].images, ...images];
          setFormData({ ...formData, colors: updatedColors });
        } else {
          setFormData({ ...formData, images: [...formData.images, ...images] });
        }
      })
      .catch(error => {
        console.error('Error processing images:', error.message);
        toast.error('Failed to process images');
      });
  };

  const removeImage = (index, colorIndex = null) => {
    if (colorIndex !== null) {
      const updatedColors = [...formData.colors];
      updatedColors[colorIndex].images.splice(index, 1);
      setFormData({ ...formData, colors: updatedColors });
    } else {
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      setFormData({ ...formData, images: updatedImages });
    }
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', stock: 0 }],
    });
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index][field] = field === 'stock' ? Number(value) : value;
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const removeSize = (index) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { color: '', colorCode: '', stock: 0, images: [] }],
    });
  };

  const updateColor = (index, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index][field] = field === 'stock' ? Number(value) : value;
    setFormData({ ...formData, colors: updatedColors });
  };

  const removeColor = (index) => {
    const updatedColors = [...formData.colors];
    updatedColors.splice(index, 1);
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || !formData.gender) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (formData.sizes.some(s => !s.size || s.stock < 0 || isNaN(s.stock))) {
        toast.error('Invalid size or stock values');
        setLoading(false);
        return;
      }
      if (formData.colors.some(c => !c.color || c.stock < 0 || isNaN(c.stock))) {
        toast.error('Invalid color or stock values');
        setLoading(false);
        return;
      }

      const hasImages = formData.images.length > 0 || formData.colors.some(c => c.images.length > 0);
      if (!hasImages) {
        toast.error('Please upload at least one product image');
        setLoading(false);
        return;
      }

      const data = {
        ...formData,
        tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        countInStock: formData.sizes.reduce((sum, s) => sum + Number(s.stock), 0) +
                      formData.colors.reduce((sum, c) => sum + Number(c.stock), 0),
        image: formData.images[0] || formData.colors[0]?.images[0] || '',
      };

      await axios.post('/api/products/vendor/my-products', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      toast.success('Product submitted for approval. Please allow up to 3 business days for review.');
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar_frame />
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="e.g., casual, trendy, summer"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
                {genders.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Age Group</option>
                {ageGroups.map(ag => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fit</label>
              <select
                name="fit"
                value={formData.fit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Fit</option>
                {fits.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Season</option>
                {seasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
            <textarea
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Sizes</label>
              <button
                type="button"
                onClick={addSize}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Size
              </button>
            </div>
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex items-center mb-2">
                <select
                  value={size.size}
                  onChange={(e) => updateSize(index, 'size', e.target.value)}
                  className="w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Size</option>
                  {sizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={size.stock}
                  onChange={(e) => updateSize(index, 'stock', e.target.value)}
                  placeholder="Stock"
                  min="0"
                  className="w-2/3 ml-2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                {formData.sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Colors</label>
              <button
                type="button"
                onClick={addColor}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Color
              </button>
            </div>
            {formData.colors.map((color, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={color.color}
                    onChange={(e) => updateColor(index, 'color', e.target.value)}
                    placeholder="Color name"
                    className="w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={color.colorCode}
                    onChange={(e) => updateColor(index, 'colorCode', e.target.value)}
                    placeholder="Hex code (e.g., #FFFFFF)"
                    className="w-1/3 ml-2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={color.stock}
                    onChange={(e) => updateColor(index, 'stock', e.target.value)}
                    placeholder="Stock"
                    min="0"
                    className="w-1/3 ml-2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, index)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                {color.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {color.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img src={img} alt={`Color ${index + 1} Image ${imgIndex + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(imgIndex, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {formData.images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/vendor/dashboard')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;