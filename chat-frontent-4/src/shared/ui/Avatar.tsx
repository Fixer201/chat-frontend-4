export default function Avatar({ src }: { src?: string }) {
  return <div className="avatar">{src ? <img src={src} alt="avatar" /> : 'A'}</div>;
}
