'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityBookingModal({ isOpen, onClose, activity }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // معلومات الحجز الأساسية
    selectedActivity: activity?.title || '',
    fullName: '',
    email: '',
    phone: '',
    participants: 4, // 👈 رقم وليس نص
    date: '',
    timeSlot: '',
    // اختيارات النشاط
    activityType: '',
    // أسئلة إضافية
    allergies: '',
    specialRequests: '',
    // تواصل
    preferredContact: 'telephone',
    additionalNotes: ''
  });

  const totalSteps = 5;
  
  // خيارات الوقت (3 créneaux)
  const timeSlots = [
    '10:00 - 12:30',
    '14:00 - 16:30',
    '18:00 - 20:30'
  ];

  // 3 أنواع أنشطة فقط
  const activityTypes = [
    { value: 'peinture', label: '🎨 Peinture & Dessin', description: 'Vins et pinceaux, acrylique, aquarelle, pastel...' },
    { value: 'crochet', label: '🧶 Crochet & Tricot', description: 'Apprenez à crocheter, amigurumi, projets collectifs' },
    { value: 'poterie', label: '🏺 Poterie & Céramique', description: 'Modelage, tournage, sculpture' }
  ];

  // Méthodes de contact
  const contactMethods = [
    { value: 'telephone', label: '📞 Téléphone' },
    { value: 'whatsapp', label: '💬 WhatsApp' },
    { value: 'email', label: '✉️ Email' }
  ];

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // إذا كان الحقل هو عدد المشاركين، نحوله إلى رقم
    if (name === 'participants') {
      setFormData({ ...formData, [name]: parseInt(value) || 1 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Envoi de la réservation:', formData);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ Réservation confirmée ! Nous contacterons ${formData.fullName} dans les 24h.`);
        onClose();
        setStep(1);
      } else {
        alert(`❌ Erreur: ${data.message || 'Problème lors de la réservation'}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert('❌ Impossible de contacter le serveur. Vérifie ta connexion.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-3xl border border-[#C87D87]/30 relative overflow-hidden"
        >
          {/* Header - Style étapes numérotées */}
          <div className="bg-gradient-to-r from-[#FBEAD6] to-[#f5ddd0] px-8 py-6 border-b border-[#C87D87]/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-['Playfair_Display',serif] italic text-3xl text-[#6B7556] mb-1">
                  Réservez votre activité
                </h2>
                <p className="font-['Cormorant_Garamond',serif] text-[#C87D87] text-lg">
                  Entre amis ou en solo, jusqu'à 12 personnes
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-[#C87D87] hover:text-[#6B7556] text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress Steps - 5 étapes */}
            <div className="flex items-center justify-between mt-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Playfair_Display',serif] text-lg
                    ${num === step 
                      ? 'bg-[#C87D87] text-white shadow-lg scale-110' 
                      : num < step 
                        ? 'bg-[#6B7556] text-white' 
                        : 'bg-[#C87D87]/20 text-[#6B7556]'}`}>
                    {num}
                  </div>
                  {num < 5 && (
                    <div className={`w-16 h-1 mx-2 ${
                      num < step ? 'bg-[#6B7556]' : 'bg-[#C87D87]/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Titre de l'étape */}
            <p className="text-center font-['Cormorant_Garamond',serif] text-[#7a6a5a] text-base mt-4">
              {step === 1 && "1. Choisissez votre activité"}
              {step === 2 && "2. Vos coordonnées"}
              {step === 3 && "3. Date et nombre de participants"}
              {step === 4 && "4. Personnalisez votre expérience"}
              {step === 5 && "5. Confirmation"}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* ÉTAPE 1: Choix de l'activité (3 activités) */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Quelle activité souhaitez-vous partager ?
                    </h3>
                    
                    <div className="grid gap-4">
                      {activityTypes.map(type => (
                        <label 
                          key={type.value} 
                          className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all
                            ${formData.activityType === type.value 
                              ? 'border-[#C87D87] bg-[#FBEAD6]/30 shadow-md' 
                              : 'border-[#C87D87]/20 hover:bg-[#FBEAD6]/20'}`}
                        >
                          <input
                            type="radio"
                            name="activityType"
                            value={type.value}
                            checked={formData.activityType === type.value}
                            onChange={handleChange}
                            className="mt-1 w-4 h-4 text-[#C87D87]"
                          />
                          <div>
                            <span className="font-['Playfair_Display',serif] text-lg text-[#6B7556] block">
                              {type.label}
                            </span>
                            <span className="font-['Cormorant_Garamond',serif] text-sm text-[#7a6a5a]">
                              {type.description}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Si l'utilisateur vient d'un clic sur activité spécifique */}
                    {activity?.title && (
                      <p className="text-center font-['Cormorant_Garamond',serif] text-[#C87D87] mt-2">
                        Activité présélectionnée : {activity.title}
                      </p>
                    )}
                  </div>
                )}

                {/* ÉTAPE 2: Informations personnelles */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Qui êtes-vous ?
                    </h3>
                    
                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Nom et prénom *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ex: Sophie Martin"
                        required
                        className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                      />
                    </div>

                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="sophie@exemple.com"
                        required
                        className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                      />
                    </div>

                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+212 6XX XXX XXX"
                        required
                        className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                      />
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3: Date, horaire et nombre - avec barre corrigée */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Quand et combien serez-vous ?
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                          Date souhaitée *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                        />
                      </div>

                      <div>
                        <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                          Horaire souhaité *
                        </label>
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                        >
                          <option value="">Sélectionnez un créneau</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Nombre de participants (max 12) *
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          name="participants"
                          min="1"
                          max="12"
                          value={formData.participants}
                          onChange={handleChange}
                          className="w-full h-2 bg-[#C87D87]/20 rounded-lg appearance-none cursor-pointer accent-[#C87D87]"
                        />
                        <span className="font-['Playfair_Display',serif] text-3xl text-[#6B7556] min-w-[3rem] text-center">
                          {formData.participants}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#C87D87] px-2 text-xs mt-1">
                        <span>1</span>
                        <span>3</span>
                        <span>6</span>
                        <span>9</span>
                        <span>12 max</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 4: Personnalisation (sans thème optionnel) */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Personnalisez votre expérience
                    </h3>
                    
                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Allergies ou restrictions alimentaires
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="Ex: sans gluten, végétarien, allergie aux fruits secs..."
                        className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                      />
                    </div>

                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Demandes spéciales
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Matériel spécifique, accessibilité, célébration particulière..."
                        className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                      />
                    </div>
                  </div>
                )}

                {/* ÉTAPE 5: Confirmation et contact */}
                {step === 5 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Comment vous contacter ?
                    </h3>
                    
                    <div>
                      <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                        Méthode de contact préférée *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {contactMethods.map(method => (
                          <label key={method.value} className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all
                            ${formData.preferredContact === method.value 
                              ? 'border-[#C87D87] bg-[#FBEAD6]/30' 
                              : 'border-[#C87D87]/20 hover:bg-[#FBEAD6]/20'}`}>
                            <input
                              type="radio"
                              name="preferredContact"
                              value={method.value}
                              checked={formData.preferredContact === method.value}
                              onChange={handleChange}
                              className="w-4 h-4 text-[#C87D87]"
                            />
                            <span className="font-['Cormorant_Garamond',serif] text-[#3a3027]">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Récapitulatif */}
                    <div className="bg-[#FBEAD6]/30 p-5 rounded-xl border border-[#C87D87]/20">
                      <h4 className="font-['Playfair_Display',serif] italic text-[#6B7556] mb-3">Récapitulatif</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#C87D87]">Activité:</span>
                          <span className="text-[#3a3027] font-medium">
                            {activityTypes.find(t => t.value === formData.activityType)?.label || activity?.title || 'Non spécifié'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#C87D87]">Participant·e:</span>
                          <span className="text-[#3a3027]">{formData.fullName || 'Non spécifié'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#C87D87]">Date:</span>
                          <span className="text-[#3a3027]">{formData.date || 'Non sélectionnée'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#C87D87]">Horaire:</span>
                          <span className="text-[#3a3027]">{formData.timeSlot || 'Non sélectionné'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#C87D87]">Personnes:</span>
                          <span className="text-[#3a3027]">{formData.participants}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#C87D87]/20">
              <button
                type="button"
                onClick={step === 1 ? onClose : prevStep}
                className="font-['Cormorant_Garamond',serif] text-[#C87D87] hover:text-[#6B7556] transition-colors px-8 py-3 border border-[#C87D87]/30 rounded-xl hover:bg-[#FBEAD6]/30"
              >
                {step === 1 ? 'Annuler' : '← Précédent'}
              </button>
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={step === 1 && !formData.activityType && !activity?.title}
                  className="bg-gradient-to-r from-[#6B7556] to-[#556b42] text-white px-8 py-3 rounded-xl font-['Cormorant_Garamond',serif] tracking-wider hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#C87D87] to-[#b56d77] text-white px-8 py-3 rounded-xl font-['Cormorant_Garamond',serif] tracking-wider hover:scale-105 transition-all shadow-lg"
                >
                  Confirmer la réservation
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}