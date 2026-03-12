import { useState } from "react";
import { motion } from "framer-motion";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your submission has been received!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="relative py-32 px-6 md:px-16 bg-surface-dark overflow-hidden">
      <div className="max-w-3xl mx-auto" style={{ perspective: "1000px" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body"
        >
          Contact us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-6xl sm:text-8xl text-foreground mb-16"
          style={{ transformStyle: "preserve-3d" as any }}
        >
          Let's create together!
        </motion.h2>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {[
            { name: "name", type: "text", placeholder: "Name" },
            { name: "email", type: "email", placeholder: "Email" },
          ].map((field) => (
            <motion.div
              key={field.name}
              animate={{
                x: focusedField === field.name ? 8 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <input
                type={field.type}
                placeholder={field.placeholder}
                required
                value={form[field.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-border py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
              />
            </motion.div>
          ))}
          <motion.div
            animate={{ x: focusedField === "message" ? 8 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              placeholder="Tell us about your event"
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
              className="w-full bg-transparent border-b border-border py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2 font-body">1000 symbols</p>
          </motion.div>
          <motion.button
            type="submit"
            className="font-body text-xs tracking-[0.2em] uppercase text-foreground border border-border px-10 py-4 hover:border-primary hover:text-primary transition-all duration-300"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px hsl(var(--primary) / 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Send Message
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
