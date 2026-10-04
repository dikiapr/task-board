interface DetailSectionProps {
  title?: string;
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, children }) => (
  <section className="k-detail__section">
    {title && <h3 className="k-detail__heading">{title}</h3>}
    {children}
  </section>
);

export default DetailSection;
