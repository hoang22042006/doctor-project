import { useState, useEffect } from "react";
import Card from "../components/Card";
import { Star } from "@phosphor-icons/react";
import { useGlobal } from "../context/GlobalContext";
import { getData } from "../utils/callAPI";

export default function ReviewPage() {
    const { user } = useGlobal();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [reviewDraft, setReviewDraft] = useState({ rating: 5, content: "" });
    const [reviews, setReviews] = useState({});

    // Gọi API để lấy danh sách bác sĩ thật cho Dropdown
    useEffect(() => {
        getData({ url: "/doctors" }).then((res) => {
            const docs = res?.data?.doctors || res?.data || [];
            setDoctors(docs);
            if (docs.length > 0) {
                setSelectedDoctorId(docs[0]._id || docs[0].id); // Mặc định chọn bác sĩ đầu tiên
            }
        }).catch(err => console.log(err));
    }, []);

    // Tìm thông tin bác sĩ đang được chọn trong Dropdown
    const selectedDoctorInfo = doctors.find(d => (d._id || d.id) === selectedDoctorId);

    const handleSubmitReview = () => {
        if (!reviewDraft.content.trim()) {
            return alert("Vui lòng nhập nội dung đánh giá!");
        }

        setReviews((prev) => ({
            ...prev,
            [selectedDoctorId]: [
                { 
                    rating: reviewDraft.rating, 
                    content: reviewDraft.content, 
                    by: user?.name || "Người dùng ẩn danh" 
                },
                ...(prev[selectedDoctorId] || [])
            ],
        }));
        setReviewDraft({ rating: 5, content: "" });
        alert(`Cảm ơn bạn đã đánh giá ${reviewDraft.rating} sao cho ${selectedDoctorInfo?.name}!`);
    };

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                
                {/* CỘT TRÁI: VIẾT ĐÁNH GIÁ */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold text-slate-800">Đánh giá bác sĩ</h2>
                    <p className="mt-1 mb-5 text-sm text-slate-500">Gửi nhận xét sau khi khám xong</p>
                    
                    <div className="space-y-4">
                        {/* Dropdown danh sách bác sĩ thật từ API */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Chọn bác sĩ</label>
                            <select 
                                value={selectedDoctorId} 
                                onChange={(e) => setSelectedDoctorId(e.target.value)} 
                                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                            >
                                {doctors.map((d) => (
                                    <option key={d._id || d.id} value={d._id || d.id}>
                                        {d.name} - {d.specialty}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dropdown số sao */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Số sao</label>
                            <select 
                                value={reviewDraft.rating} 
                                onChange={(e) => setReviewDraft((p) => ({ ...p, rating: Number(e.target.value) }))} 
                                className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                            >
                                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}
                            </select>
                        </div>

                        {/* Ô nhập đánh giá */}
                        <textarea 
                            value={reviewDraft.content} 
                            onChange={(e) => setReviewDraft((p) => ({ ...p, content: e.target.value }))} 
                            className="min-h-32 w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400" 
                            placeholder="Viết đánh giá của bạn..." 
                        />
                        
                        <button
                            onClick={handleSubmitReview}
                            className="w-full rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 shadow-md"
                        >
                            Gửi đánh giá
                        </button>
                    </div>
                </Card>

                {/* CỘT PHẢI: XEM ĐÁNH GIÁ (Hiển thị theo bác sĩ đang chọn) */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-slate-800">Phản hồi gần đây</h3>
                    <p className="mt-1 mb-5 text-sm text-slate-500">
                        Đánh giá về: <strong className="text-sky-600">{selectedDoctorInfo?.name || "Bác sĩ"}</strong>
                    </p>
                    
                    <div className="space-y-4">
                        {(reviews[selectedDoctorId] || [
                            { rating: 5, content: "Bác sĩ tư vấn rất kỹ và dễ hiểu, kê đơn uống rất nhanh khỏi.", by: "Mai Lan" },
                            { rating: 4, content: "Quy trình đặt lịch nhanh, phòng khám sạch sẽ.", by: "Văn Hùng" },
                        ]).map((r, idx) => (
                            <div key={idx} className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <div className="font-bold text-slate-800">{r.by}</div>
                                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-500">
                                        <Star size={14} weight="fill" /> {r.rating}
                                    </div>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{r.content}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </main>
    );
}
