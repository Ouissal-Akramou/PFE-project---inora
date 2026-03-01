'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityBookingModal({ isOpen, onClose, activity }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    activity: activity?.title || '',
    location: '',
    participants: '2',
    date: '',
    phone: '',
    specialRequests: ''
  });

  const totalSteps = 4;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    // Ici tu peux ajouter l'appel API pour envoyer la réservation
    alert('Demande de réservation envoyée ! Nous vous contacterons bientôt.');
    onClose();
    setStep(1);
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
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-[#C87D87]/30 relative overflow-hidden"
        >
          {/* Header avec titre et progression */}
          <div className="bg-gradient-to-r from-[#FBEAD6] to-[#f5ddd0] p-8 pb-6 border-b border-[#C87D87]/20">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-['Playfair_Display',serif] italic text-3xl text-[#6B7556] mb-1">
                  Réserver votre expérience
                </h2>
                <p className="font-['Cormorant_Garamond',serif] text-[#C87D87] text-lg">
                  {activity?.title || 'Activité sélectionnée'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-[#C87D87] hover:text-[#6B7556] text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2 text-sm font-['Cormorant_Garamond',serif] text-[#6B7556]">
                <span>Étape {step}/{totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-[#C87D87]/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#6B7556] to-[#C87D87]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Formulaire avec étapes */}
          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Étape 1: Choix du lieu */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Où souhaitez-vous vivre cette expérience ?
                    </h3>
                    <div className="grid gap-4">
                      {['Plage', 'Montagne', 'Jardin', 'Forêt', 'Bord de lac', 'Autre'].map((lieu) => (
                        <label key={lieu} className="flex items-center gap-3 p-4 border border-[#C87D87]/20 rounded-xl hover:bg-[#FBEAD6]/30 cursor-pointer transition-all">
                          <input
                            type="radio"
                            name="location"
                            value={lieu}
                            checked={formData.location === lieu}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#C87D87] focus:ring-[#C87D87]"
                          />
                          <span className="font-['Cormorant_Garamond',serif] text-lg text-[#3a3027]">{lieu}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Étape 2: Nombre de participants */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Combien de personnes serez-vous ?
                    </h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        name="participants"
                        min="1"
                        max="20"
                        value={formData.participants}
                        onChange={handleChange}
                        className="w-full h-2 bg-[#C87D87]/20 rounded-lg appearance-none cursor-pointer accent-[#C87D87]"
                      />
                      <span className="font-['Playfair_Display',serif] text-3xl text-[#6B7556] min-w-[3rem] text-center">
                        {formData.participants}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#C87D87] px-2">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20+</span>
                    </div>
                  </div>
                )}

                {/* Étape 3: Date et détails */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Quand souhaitez-vous réserver ?
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                          Date préférée
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                          Demandes spéciales (optionnel)
                        </label>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Allergies, préférences, besoins particuliers..."
                          className="w-full p-3 border border-[#C87D87]/30 rounded-xl bg-white/50 focus:outline-none focus:border-[#C87D87] font-['Cormorant_Garamond',serif]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 4: Coordonnées */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-4">
                      Vos coordonnées
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block font-['Cormorant_Garamond',serif] text-[#6B7556] mb-2">
                          Numéro de téléphone
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
                        <p className="text-xs text-[#C87D87] mt-2">
                          Nous vous contacterons pour confirmer votre réservation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#C87D87]/20">
              <button
                type="button"
                onClick={step === 1 ? onClose : prevStep}
                className="font-['Cormorant_Garamond',serif] text-[#C87D87] hover:text-[#6B7556] transition-colors px-6 py-2"
              >
                {step === 1 ? 'Annuler' : 'Précédent'}
              </button>
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-[#6B7556] to-[#556b42] text-white px-8 py-3 rounded-xl font-['Cormorant_Garamond',serif] tracking-wider hover:scale-105 transition-all shadow-lg"
                >
                  Continuer
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

          {/* Petit rappel des étapes */}
          <div className="px-8 pb-6 flex justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step ? 'bg-[#C87D87] w-4' : s < step ? 'bg-[#6B7556]' : 'bg-[#C87D87]/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}