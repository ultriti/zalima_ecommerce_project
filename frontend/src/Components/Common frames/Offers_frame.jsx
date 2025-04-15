import React from 'react'

function Offers_frame() {

    const services = [
        {
            icon: '🚚',
            title: 'Easy Free Delivery',
            description: 'Order on $1500*',
        },
        {
            icon: '🛡️',
            title: 'Premium Warranty',
            description: 'Up to 2 years',
        },
        {
            icon: '📦',
            title: 'Easy Free Return',
            description: '15 days return',
        },
        {
            icon: '🎧',
            title: '24*7 Online Support',
            description: 'Premium service',
        },
        {
            icon: '🎁',
            title: 'Best Special Gifts',
            description: 'First Order',
        },
    ];



    return (
        <div className="flex justify-evenly h-[70%] w-[90%] items-center py-6 bg-gray-200 rounded-[10px] shadow-md">
            {services.map((service, index) => (
                <div key={index} className="flex flex-col items-center border-r-2 mx-1 px-4">
                    <div className="text-3xl ">{service.icon}</div>
                    <p className="font-bold text-sm">{service.title}</p>
                    <p className="text-xs text-gray-500">{service.description}</p>
                </div>
            ))}
        </div>
    )
}

export default Offers_frame
