"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { load } from "@cashfreepayments/cashfree-js";
import { MapPin, Plus, Trash2, Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Address State
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const [newAddress, setNewAddress] = useState({
        name: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [cartRes, addrRes] = await Promise.all([
                    axios.get("/api/cart").catch(() => ({ data: { data: { items: [] } } })),
                    axios.get("/api/profile/address").catch(() => ({ data: { data: [] } }))
                ]);

                const cartItems = cartRes.data.data?.items || [];
                if (cartItems.length === 0) {
                    router.push("/cart");
                    return;
                }
                setItems(cartItems);

                const addrs = addrRes.data.data || [];
                setSavedAddresses(addrs);

                if (addrs.length > 0) {
                    setSelectedAddressId(addrs[0]._id);
                } else {
                    setShowNewAddressForm(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, router]);

    const handleSaveNewAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            toast.error("Please fill in all address fields");
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.post("/api/profile/address", newAddress);
            setSavedAddresses(res.data.data.addresses);
            toast.success("Address saved successfully");

            // Pick newly added target
            const updatedAddrs = res.data.data.addresses;
            if (updatedAddrs.length > 0) {
                setSelectedAddressId(updatedAddrs[updatedAddrs.length - 1]._id);
            }
            setShowNewAddressForm(false);
            setNewAddress({ name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save address");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this address?")) return;

        try {
            const res = await axios.delete(`/api/profile/address?id=${id}`);
            const updated = res.data.data.addresses;
            setSavedAddresses(updated);

            if (updated.length === 0) {
                setSelectedAddressId("");
                setShowNewAddressForm(true);
            } else if (selectedAddressId === id) {
                setSelectedAddressId(updated[0]._id);
            }
            toast.success("Address deleted");
        } catch (err) {
            toast.error("Failed to delete address");
        }
    };

    const placeOrder = async () => {
        let finalAddress = null;

        if (showNewAddressForm) {
            toast.error("Please save your new address first.");
            return;
        }

        finalAddress = savedAddresses.find(a => a._id === selectedAddressId);
        if (!finalAddress) {
            toast.error("Please select a delivery address.");
            return;
        }

        setSubmitting(true);
        let toastId;

        try {
            if (paymentMethod === 'cod') {
                await axios.post("/api/orders", {
                    address: finalAddress,
                    paymentMethod: "cod"
                });
                toast.success("Order Placed Successfully! 🎉");
                router.push("/orders");
            } else {
                toastId = toast.loading("Connecting to Cashfree Secure Gateway...");

                // 1. Initialize Cashfree (Sandbox on localhost, production else)
                const cashfree = await load({
                    mode: "sandbox", // We're using Sandbox API keys based on `.env`
                });

                // 2. Hit our backend to create a pending order and get a Cashfree Payment Session ID
                const { data: resData } = await axios.post("/api/orders/payment", {
                    address: finalAddress,
                    paymentMethod: paymentMethod
                });

                if (!resData?.data?.payment_session_id) {
                    throw new Error("Failed to generate payment session");
                }

                toast.dismiss(toastId);

                // 3. Launch Cashfree SDK Modal & define return URL
                let checkoutOptions = {
                    paymentSessionId: resData.data.payment_session_id,
                    returnUrl: `${window.location.origin}/payment/verify?order_id={order_id}`
                };

                cashfree.checkout(checkoutOptions);
                // Return here so it leaves the page in a "submitting" state while the gateway opens
                return;
            }
        } catch (err: any) {
            if (toastId) toast.dismiss(toastId);
            toast.error(err.response?.data?.message || "Something went wrong while placing the order");
        } finally {
            setSubmitting(false);
        }
    };

    const total = items.reduce((s, i) => s + (i.productId?.price || 0) * i.qty, 0);
    const delivery = total >= 199 ? 0 : 49;

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="max-w-[1240px] mx-auto px-4 py-8">
            <h1 className="font-baloo text-3xl font-bold text-indigo-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

                {/* Left Side: Address Form */}
                <div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-baloo text-gray-800 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Delivery Address
                            </h2>
                            {savedAddresses.length > 0 && savedAddresses.length < 3 && !showNewAddressForm && (
                                <button onClick={() => setShowNewAddressForm(true)} className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:text-orange-600">
                                    <Plus size={16} /> Add New Address
                                </button>
                            )}
                        </div>

                        {/* List of Saved Addresses */}
                        {savedAddresses.length > 0 && !showNewAddressForm && (
                            <div className="space-y-3">
                                {savedAddresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddressId(addr._id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3 relative overflow-hidden ${selectedAddressId === addr._id ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-orange-300'}`}
                                    >
                                        <div className="mt-1">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-orange-500' : 'border-gray-300'}`}>
                                                {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-gray-800">{addr.name}</p>
                                                <div className="flex gap-2">
                                                    {selectedAddressId === addr._id && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 rounded-full font-bold uppercase py-0.5">Selected</span>}
                                                    <button onClick={(e) => handleDeleteAddress(addr._id, e)} className="text-gray-400 hover:text-red-500 p-1 -mr-1 -mt-1"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1 leading-relaxed"><MapPin size={14} className="inline mr-1 text-gray-400 -mt-0.5" />{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p className="text-sm text-gray-600"><strong>Mobile:</strong> +91 {addr.phone}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Address Form */}
                        {showNewAddressForm && (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5">
                                <h3 className="font-bold text-gray-700 mb-4">{savedAddresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}</h3>
                                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input label="Full Name" placeholder="e.g. Rahul Kumar" value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} required />
                                        <Input label="Mobile Number" placeholder="10-digit mobile number" type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} maxLength={10} required />
                                    </div>
                                    <Input label="Address (House No, Building, Street, Area)" placeholder="123, ABC Colony, MG Road..." value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} required />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Input label="City" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                        <Input label="State" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                        <Input label="Pincode" placeholder="Pincode" type="text" maxLength={6} value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" disabled={submitting}>Save Address</Button>
                                        {savedAddresses.length > 0 && (
                                            <Button type="button" variant="outline" onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <h2 className="text-xl font-bold font-baloo text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Payment Options
                        </h2>

                        <div className="space-y-3">
                            {/* UPI */}
                            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-orange-300'}`}>
                                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500 mt-1" />
                                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 block">UPI (GPay, PhonePe, Paytm)</span>
                                    <span className="text-xs text-gray-500">Pay directly from your bank account</span>
                                </div>
                            </label>

                            {/* Credit/Debit Card */}
                            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-orange-300'}`}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500 mt-1" />
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-semibold text-gray-800 block">Credit / Debit Card</span>
                                    <span className="text-xs text-gray-500">Visa, Mastercard, RuPay, Discover</span>
                                </div>
                                <div className="hidden sm:flex gap-1 opacity-50">
                                    {/* Fake tiny card logos using CSS just for visuals */}
                                    <div className="w-8 h-5 bg-gradient-to-br from-blue-700 to-blue-500 rounded text-[10px] text-white font-bold flex flex-col justify-center items-center italic tracking-tighter">VISA</div>
                                    <div className="w-8 h-5 bg-gray-800 rounded flex justify-center items-center">
                                        <div className="w-3 h-3 rounded-full bg-red-500 -mr-1 opacity-90 mix-blend-screen"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-90 mix-blend-screen"></div>
                                    </div>
                                </div>
                            </label>

                            {/* Net Banking */}
                            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'netbanking' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-orange-300'}`}>
                                <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500 mt-1" />
                                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                                    <Landmark size={24} />
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 block">Net Banking</span>
                                    <span className="text-xs text-gray-500">All major Indian banks supported</span>
                                </div>
                            </label>

                            {/* COD */}
                            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-orange-300'}`}>
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500 mt-1" />
                                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                                    <Banknote size={24} />
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 block">Cash on Delivery (COD)</span>
                                    <span className="text-xs text-gray-500">Pay at your doorstep</span>
                                </div>
                            </label>
                        </div>

                    </div>
                </div>

                {/* Right Side: Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                        <h2 className="font-baloo text-xl font-bold text-gray-800 mb-4 border-b pb-4">Order Summary</h2>

                        {/* Products map (compact) */}
                        <div className="space-y-4 mb-6 pt-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img src={item.productId?.images?.[0]} alt={item.productId?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <p className="font-semibold text-gray-800 line-clamp-1">{item.productId?.name}</p>
                                        <p className="text-gray-500 flex justify-between mt-1">
                                            <span>Qty: {item.qty} {item.size && `| Size: ${item.size}`}</span>
                                            <span className="font-bold text-gray-800">₹{item.productId?.price * item.qty}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm border-t pt-4">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{total}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Delivery Charge</span><span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
                            <div className="border-t pt-3 flex justify-between font-bold text-xl text-indigo-900">
                                <span>Total Amount</span><span>₹{total + delivery}</span>
                            </div>
                        </div>

                        <Button
                            onClick={placeOrder}
                            fullWidth
                            size="lg"
                            className="mt-6"
                            disabled={submitting}
                        >
                            {submitting ? "Placing Order..." : paymentMethod === 'cod' ? "Place Order (COD)" : "Proceed to Payment"}
                        </Button>
                        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                            🔒 Safe and Secure Checkout
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
