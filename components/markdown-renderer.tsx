import { Textarea } from '@nextui-org/input';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface MarkdownContextType {
  headings: Heading[];
  parsedContent: string;
  activeHeadingId: string | null;
  handleHeadingClick: (id: string) => void;
  contentRef: React.RefObject<HTMLDivElement>;
  mdContent: string;
  setMdContent: (markdown: string) => void;
}

interface CustomTransforms {
  [key: string]: (...args: any[]) => string;
}

interface MarkdownRendererProps {
  markdown: string;
  setMdContent: (markdown: string) => void;
  customTransforms?: CustomTransforms;
  children: ReactNode;
}

interface TreeProps {
  className?: string;
}

interface PreviewProps {
  className?: string;
  scrollToBottom?: boolean;
}

interface EditProps {
  className?: string;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(
  undefined
);

const MarkdownRenderer: React.FC<MarkdownRendererProps> & {
  Tree: React.FC<TreeProps>;
  Preview: React.FC<PreviewProps>;
  Edit: React.FC<EditProps>;
} = ({ markdown, setMdContent, customTransforms, children }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [parsedContent, setParsedContent] = useState('');
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const extractHeadings = (md: string): void => {
      const headingRegex = /^(#{1,3})\s+(.+)$/gm;
      const extractedHeadings: Heading[] = [];
      let match;

      while ((match = headingRegex.exec(md)) !== null) {
        extractedHeadings.push({
          level: match[1].length,
          text: match[2],
          id: match[2].toLowerCase().replace(/\s+/g, '-') + match[1].length,
        });
      }

      setHeadings(extractedHeadings);
    };

    const parseMarkdown = async () => {
      const renderer = new marked.Renderer();

      renderer.heading = ({ text, depth }) => {
        const id = text.toLowerCase().replace(/\s+/g, '-') + depth;

        return `<h${depth} id="${id}">${text}</h${depth}>`;
      };

      renderer.link = ({ href, text }) => {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      };

      Object.keys(customTransforms || {}).forEach((key) => {
        // @ts-ignore
        if (typeof renderer[key] === 'function' && key !== 'heading') {
          // @ts-ignore
          const originalRenderer = renderer[key];

          // @ts-ignore
          renderer[key] = (...args: any[]) => {
            const result = originalRenderer.apply(renderer, args);

            return customTransforms![key](result, ...args);
          };
        }
      });

      const parsed = await marked(markdown, {
        renderer,
      });

      setParsedContent(DOMPurify.sanitize(parsed, { ADD_ATTR: ['target'] }));
    };

    extractHeadings(markdown);
    parseMarkdown();
  }, [markdown, customTransforms]);

  const handleHeadingClick = useCallback((id: string): void => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const headingElements = contentRef.current.querySelectorAll(
        'h1, h2, h3, h4, h5, h6'
      );
      let currentHeadingId: string | null = null;

      for (const headingElement of Array.from(headingElements)) {
        const rect = headingElement.getBoundingClientRect();

        if (rect.top <= 50) {
          currentHeadingId = headingElement.id;
        } else {
          break;
        }
      }

      setActiveHeadingId(currentHeadingId);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <MarkdownContext.Provider
      value={{
        headings,
        parsedContent,
        activeHeadingId,
        handleHeadingClick,
        contentRef,
        mdContent: markdown,
        setMdContent,
      }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};

interface TreeProps {
  className?: string;
  isExpanded: boolean;
  onExpandToggle: (expanded: boolean) => void;
}

const Tree: React.FC<TreeProps> = ({
  className,
  isExpanded,
  onExpandToggle,
}) => {
  const context = useContext(MarkdownContext);

  if (!context) throw new Error('Tree must be used within a MarkdownRenderer');
  const { headings, handleHeadingClick, activeHeadingId } = context;

  const toggleExpand = () => {
    onExpandToggle(!isExpanded);
  };

  return (
    <nav className={`${className} relative`}>
      <button
        aria-label={isExpanded ? 'Collapse tree' : 'Expand tree'}
        className="absolute right-2 top-2 z-10"
        onClick={toggleExpand}
      >
        {isExpanded ? (
          <svg
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="18"
              x2="6"
              y1="6"
              y2="18"
            />
            <line
              x1="6"
              x2="18"
              y1="6"
              y2="18"
            />
          </svg>
        ) : (
          <svg
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="3"
              x2="21"
              y1="12"
              y2="12"
            />
            <line
              x1="3"
              x2="21"
              y1="6"
              y2="6"
            />
            <line
              x1="3"
              x2="21"
              y1="18"
              y2="18"
            />
          </svg>
        )}
      </button>
      {isExpanded && (
        <ul className="list-none p-0">
          <li className="ml-0 ml-1 ml-12 ml-4 ml-8 hidden" />
          {headings.map((heading, index) => (
            <li
              key={index}
              className={clsx(
                `my-1`,
                heading.level > 1 ? `ml-${(heading.level - 1) * 4}` : 'ml-0'
              )}
            >
              <button
                className={`w-full rounded p-1 text-left ${
                  activeHeadingId === heading.id
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-secondary-400 hover:text-white'
                }`}
                onClick={() => handleHeadingClick(heading.id)}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

const Preview: React.FC<PreviewProps> = ({ className, scrollToBottom }) => {
  const context = useContext(MarkdownContext);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!context)
    throw new Error('Preview must be used within a MarkdownRenderer');
  const { parsedContent } = context;

  useEffect(() => {
    if (containerRef.current && scrollToBottom) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 100);
    }
  }, [parsedContent, scrollToBottom]);

  return (
    <div className={`markdown-preview relative ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: parsedContent }}
        ref={containerRef}
      />
    </div>
  );
};

const Edit: React.FC<EditProps> = ({ className }) => {
  const context = useContext(MarkdownContext);

  if (!context)
    throw new Error('Preview must be used within a MarkdownRenderer');
  const { mdContent } = context;

  return (
    <Textarea
      maxRows={50}
      minRows={5}
      value={mdContent}
      onChange={(e) => context.setMdContent(e.target.value)}
    />
  );
};

MarkdownRenderer.Tree = Tree;
MarkdownRenderer.Preview = Preview;
MarkdownRenderer.Edit = Edit;

export default MarkdownRenderer;
