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
        <div className="flex justify-evenly h-[100%] w-[100%] items-center py-6 bg-gray-200 rounded-[10px] shadow-md overflow-x-auto md:h-[100%]">
            {services.map((service, index) => (
                <div key={index} className="flex flex-col items-center justify-center border-r-2 mx-1 px-4 ">
                    <div className="text-3xl md:text-3xl">{service.icon}</div>
                    <p className="font-bold text-[2vw] md:text-[1vw]">{service.title}</p>
                    <p className="text-[2vw] text-gray-500 md:text-xs">{service.description}</p>
                </div>
            ))}
        </div>
    )
}

export default Offers_frame
