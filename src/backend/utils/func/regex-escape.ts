
export function regexEscape(query: string): string {
    return query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
