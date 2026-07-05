import React from 'react';
import {
  Laptop, Phone, Globe, Lock, Settings, Rocket,
  GraduationCap, BookOpen, Pencil, School, Microscope, FlaskConical,
  Scale, Landmark, Vote, Megaphone, Handshake, Users,
  Sprout, Trees, Waves, Mountain, Flame, Wind,
  HeartPulse, Stethoscope, Pill, Brain, Heart, Salad,
  Palette, Theater, Film, Music, Camera, Gamepad2,
  Briefcase, TrendingUp, Coins, Store, Plane, Map,
  MessageSquare, AlertTriangle, Star, Check, CheckCircle2, XCircle, HelpCircle
} from 'lucide-react';

const EMOJI_MAP: Record<string, React.ComponentType<any>> = {
  "💻": Laptop,
  "📱": Phone,
  "🌐": Globe,
  "🔒": Lock,
  "⚙️": Settings,
  "⚙": Settings,
  "🚀": Rocket,
  "🎓": GraduationCap,
  "📚": BookOpen,
  "✏️": Pencil,
  "✏": Pencil,
  "🏫": School,
  "🔬": Microscope,
  "🧪": FlaskConical,
  "⚖️": Scale,
  "⚖": Scale,
  "🏛️": Landmark,
  "🏛": Landmark,
  "🗳️": Vote,
  "🗳": Vote,
  "📢": Megaphone,
  "🤝": Handshake,
  "👥": Users,
  "🌾": Sprout,
  "🌲": Trees,
  "🌊": Waves,
  "⛰️": Mountain,
  "⛰": Mountain,
  "🔥": Flame,
  "💨": Wind,
  "🏥": HeartPulse,
  "🩺": Stethoscope,
  "💊": Pill,
  "🧠": Brain,
  "❤️": Heart,
  "🥗": Salad,
  "🎨": Palette,
  "🎭": Theater,
  "🎬": Film,
  "🎵": Music,
  "📷": Camera,
  "👾": Gamepad2,
  "💼": Briefcase,
  "📈": TrendingUp,
  "💰": Coins,
  "🏬": Store,
  "✈️": Plane,
  "✈": Plane,
  "🗺️": Map,
  "🗺": Map,
  "💬": MessageSquare,
  "⚠️": AlertTriangle,
  "★": Star,
  "☆": Star,
  "✓": Check,
  "✅": CheckCircle2,
  "❌": XCircle
};

interface DynamicIconProps {
  emoji: string;
  className?: string;
  size?: number;
  color?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ emoji, className, size = 20, color }) => {
  const IconComponent = EMOJI_MAP[emoji] || EMOJI_MAP[emoji.trim()] || HelpCircle;
  return <IconComponent className={className} size={size} color={color} />;
};
