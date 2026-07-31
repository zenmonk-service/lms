import { Variants, motion } from "framer-motion";

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1];

const contentVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.35, ease },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.35, ease },
      opacity: { duration: 0.15 },
    },
  },
};

interface IProps {
  open: boolean;
  children: React.ReactNode;
}

const Collapse = ({ open, children }: IProps) => {
  return (
    <motion.div
      initial={false}
      animate={open ? "open" : "closed"}
      variants={contentVariants}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default Collapse;
