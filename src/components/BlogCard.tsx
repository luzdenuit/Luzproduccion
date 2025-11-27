import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  image: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  slug: string;
}

const BlogCard = ({ image, title, category, date, excerpt, slug }: BlogCardProps) => {
  return (
    <Link to={`/blog/${slug}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="group h-full"
      >
        <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              {category}
            </Badge>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            <p className="text-xs text-muted-foreground mb-3">{date}</p>
            <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
              {excerpt}
            </p>
            <span className="text-primary text-sm font-medium inline-flex items-center group-hover:underline">
              Leer más
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default BlogCard;
