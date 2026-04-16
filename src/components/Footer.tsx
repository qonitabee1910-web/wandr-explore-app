import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background py-10 hidden md:block">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div>
        <h4 className="font-bold text-lg mb-3">PYU-GO</h4>
        <p className="text-background/70 leading-relaxed">
          Platform booking shuttle & ride terpercaya di Indonesia.
        </p>
      </div>
      <div>
        <h5 className="font-semibold mb-3">Produk</h5>
        <ul className="space-y-2 text-background/70">
          <li><Link to="/shuttle" className="hover:text-background">Tiket Shuttle</Link></li>
          <li><Link to="/ride" className="hover:text-background">Ride Hailing</Link></li>
          <li><Link to="/promos" className="hover:text-background">Promo</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold mb-3">Dukungan</h5>
        <ul className="space-y-2 text-background/70">
          <li><span>Pusat Bantuan</span></li>
          <li><span>Kebijakan Privasi</span></li>
          <li><span>Syarat & Ketentuan</span></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold mb-3">Ikuti Kami</h5>
        <ul className="space-y-2 text-background/70">
          <li><span>Instagram</span></li>
          <li><span>Twitter</span></li>
          <li><span>Facebook</span></li>
        </ul>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-8 pt-6 border-t border-background/20 text-center text-xs text-background/50">
      © 2026 PYU-GO. Ride, Shuttle & Hotel Booking Platform.
    </div>
  </footer>
);

export default Footer;
