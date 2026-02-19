import React from 'react';

const Inventory: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
            <p className="text-gray-400">Track and manage your pharmaceutical supplies.</p>
            <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-900">
                            <th className="p-4 border-b border-gray-700">Medicine Name</th>
                            <th className="p-4 border-b border-gray-700">Stock</th>
                            <th className="p-4 border-b border-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-700">
                            <td className="p-4">Amoxicillin</td>
                            <td className="p-4">500 units</td>
                            <td className="p-4"><span className="px-2 py-1 bg-green-900 text-green-400 rounded-full text-xs">In Stock</span></td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-4">Paracetamol</td>
                            <td className="p-4">1,200 units</td>
                            <td className="p-4"><span className="px-2 py-1 bg-green-900 text-green-400 rounded-full text-xs">In Stock</span></td>
                        </tr>
                        <tr>
                            <td className="p-4">Lisinopril</td>
                            <td className="p-4">5 units</td>
                            <td className="p-4"><span className="px-2 py-1 bg-red-900 text-red-400 rounded-full text-xs">Low Stock</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
