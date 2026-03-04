import os
import re

root_dir = r"c:\Users\franc\OneDrive\Documentos\Camarai\CamaraiDashboardFinal\src\app"

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Replace size="md" with size="md"
    # content = content.replace('size="md"', 'size="md"')
    # Wait, simple replace might affect other components if they use size="md".
    # But Button is the main one. The grep showed Button mostly.
    # Let's use regex to target Button.
    
    # Regex for Button tag opening. 
    # It might span multiple lines, but attributes usually don't contain > unless in quotes.
    # We want to change size="md" to size="md" IF it is inside a <Button ... > tag.
    # Actually, simpler: just global replace size="md" -> size="md" 
    # and then handle the inner icon classes.
    # Risks: If another component strictly needs size="md".
    # Grid/Layout components usually use numbers or object syntax.
    # "icon" is a very specific string enum value.
    # I'll chance the global replace for size="md" -> size="md" inside .tsx files.
    
    content = content.replace('size="md"', 'size="md"')
    
    # 2. Remove className from icons inside Buttons with size="md" (or just generally icons inside buttons?)
    # "and without classes"
    # This implies removing className="..." from the Icon component.
    # Pattern: <Button ...><IconName className="..." /></Button>
    # OR <Button ...> <IconName className="..." /> </Button>
    # We want <Button ...><IconName /></Button>
    
    # We can use regex to find <Button...>(content)</Button>
    # But nested buttons? Unlikely.
    # But multiline content...
    
    # Let's accept that we might iterate over all lines or chunks.
    
    # Regex to find an Icon inside a Button and strip its className.
    # Assuming the Button is relatively small/inline.
    
    # Pattern: 
    # <Button[^>]*size="md"[^>]*>\s*<([A-Z][a-zA-Z0-9]*)\s+className="[^"]*"\s*(/>|>\s*</\1>)
    
    def replacer(match):
        # match.group(0) is the whole string
        # match.group(1) is the Icon Name e.g. "MoreHorizontal"
        # match.group(2) are attributes before className
        # match.group(3) are attributes after className?
        # This is getting complicated to parse reliably with regex.
        return match.group(0) # placeholder

    # Let's try a simpler approach for the "without classes" part.
    # If we find <Button ... size="md" ...> ... <Icon className="..." ...> ... </Button>
    # We remove the className from Icon.
    
    # Helper to clean icon classes
    # We match: (<Button[^>]*size="md"[^>]*>\s*<[A-Z][a-zA-Z0-9]*)(\s+className="[^"]*")([^>]*/>)
    # This handles self-closing icons which are most common: <MoreHorizontal className="..." />
    
    # Regex:
    # (<Button\s[^>]*size="md"[^>]*>\s*<[A-Z][A-Za-z0-9]+)([^>]*?)(\s+className="[^"]*")([^>]*/>)
    # This assumes the icon is immediate child and self-closing.
    
    pattern1 = re.compile(r'(<Button\s[^>]*size="md"[^>]*>\s*<[A-Z][A-Za-z0-9]+)([^>]*?)(\s+className="[^"]*")([^>]*/?>\s*</Button>)', re.DOTALL)
    # This handles <Button..><Icon className.. /></Button>
    
    # We iterate until no more changes?
    
    # Let's refine the regex to be more permissive about spacing and attributes
    # Match <Button [anything including newlines] size="md" [anything]> [spaces] <IconName [attrs] className="..." [attrs] /> [spaces] </Button>
    
    # regex for Button open tag with size="md"
    # (<Button(?=\s)[^>]*?\bsize="md"[^>]*?>)\s*(<[A-Z][A-Za-z0-9]+)([^>]*?)\s+className="[^"]*"([^>]*?)(/?>)\s*</Button>
    
    pattern = re.compile(
        r'(<Button(?=\s)[^>]*?\bsize="md"[^>]*?>)\s*(<[A-Z][A-Za-z0-9]+)([^>]*?)\s+className="[^"]*"([^>]*?)(/?>\s*</Button>)',
        re.DOTALL
    )
    
    # Replacement: \1\2\3\4\5  (omitting the className part)
    
    new_content = content
    # Apply regex substitution
    # We do it repeatedly because regex might overlap? No, dotall matches one instance.
    # BUT re.sub handles all non-overlapping occurrences.
    
    new_content = pattern.sub(r'\1\2\3\4\5', new_content)
    
    # Also handle the closed tag case: <Icon ...></Icon> ? Rare for Lucide icons. They are usually self-closing or empty.
    
    if new_content != original_content:
        print(f"Modifying {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))
