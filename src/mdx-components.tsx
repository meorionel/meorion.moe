import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		p: ({ children }) => <p className="py-2 leading-6">{children}</p>,
		h1: ({ children }) => <h1 className="bg-rp-susu text-rp-text px-4">{children}</h1>,
		h2: ({ children }) => <h2 className="text-rp-rose py-3 font-bold before:content-['##_']">{children}</h2>,
		h3: ({ children }) => <h3 className="text-rp-rose py-3 font-bold before:content-['###_']">{children}</h3>,
		h4: ({ children }) => <h4 className="text-rp-rose py-3 font-bold before:content-['####_']">{children}</h4>,
		code: ({ children }) => <code className="text-rp-susu before:content-['`'] after:content-['`']">{children}</code>,
		ul: ({ children }) => (
			<ul className="ml-0 list-inside list-['-_'] space-y-1 [&_ul]:mt-1 [&_ul]:ml-6">
				{children}
			</ul>
		),
		a: ({ href, children, ...props }) => (
			<a
				className="text-rp-susu underline"
				href={href}
				target={href?.startsWith("http") ? "_blank" : undefined}
				rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
				{...props}
			>
				{children}
			</a>
		),
		...components,
	};
}
