import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, PenSquare, Link as LinkIcon, AlertCircle, Type, Palette, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management Guide</CardTitle>
          <CardDescription>
            How to manage the static and dynamic content of the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-card-foreground/5">
              <div className="flex items-center gap-3">
                  <PenSquare className="h-8 w-8 text-accent" />
                  <div>
                      <h3 className="text-lg font-semibold">Content Editor</h3>
                      <p className="text-sm text-muted-foreground">A user-friendly editor to manage documentation.</p>
                  </div>
              </div>
              <div className="mt-4 text-sm space-y-2">
                  <p>
                    You can now use the Content Editor to visually manage the <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono">docs-data.json</code> file. This interface allows for creating, editing, and deleting categories and documents without needing to touch the JSON file directly.
                  </p>
                  <Button asChild variant="default" className="mt-2">
                      <Link href="/admin/content-editor">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Go to Content Editor
                      </Link>
                  </Button>
              </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-card-foreground/5">
              <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-accent" />
                  <div>
                      <h3 className="text-lg font-semibold">Documentation Data File</h3>
                      <p className="text-sm text-muted-foreground">All documentation pages are managed via a single JSON file.</p>
                  </div>
              </div>
              <div className="mt-4 text-sm space-y-2">
                  <p>
                      The file responsible for all documentation content is located at <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono">src/lib/docs-data.json</code>.
                  </p>
                  <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Manual Edits</AlertTitle>
                      <AlertDescription>
                          While manual editing is possible, it is recommended to use the Content Editor to avoid syntax errors in the JSON file. Always make a backup before manual changes.
                      </AlertDescription>
                  </Alert>
              </div>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Type className="h-8 w-8 text-accent" />
                <div>
                     <CardTitle>Markdown Styling Guide</CardTitle>
                     <CardDescription>Available syntax for documentation content.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground mb-4">
            Our documentation pages are rendered from Markdown, including support for GitHub Flavored Markdown (GFM).
           </p>
           <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-4 bg-card-foreground/5">
            <h3>Basic Formatting</h3>
            <ul>
                <li><code>**Bold Text**</code> renders as <strong>Bold Text</strong></li>
                <li><code>*Italic Text*</code> renders as <em>Italic Text</em></li>
                <li><code>~~Strikethrough~~</code> renders as <del>Strikethrough</del></li>
                <li><code>`Inline Code`</code> renders as <code>Inline Code</code></li>
            </ul>

            <h3>Headings</h3>
            <pre className="bg-muted p-2 rounded-md"><code>
                # Heading 1<br/>
                ## Heading 2<br/>
                ### Heading 3
            </code></pre>

            <h3>Lists</h3>
            <p>Unordered List:</p>
            <pre className="bg-muted p-2 rounded-md"><code>
                - Item 1<br/>
                - Item 2<br/>
                &nbsp;&nbsp;- Nested Item
            </code></pre>
            <p>Ordered List:</p>
            <pre className="bg-muted p-2 rounded-md"><code>
                1. First Item<br/>
                2. Second Item
            </code></pre>
             <p>Task List:</p>
            <pre className="bg-muted p-2 rounded-md"><code>
                - [x] Completed task<br/>
                - [ ] Incomplete task
            </code></pre>


            <h3>Blockquotes</h3>
            <pre className="bg-muted p-2 rounded-md"><code>
                &gt; This is a blockquote. It's great for highlighting important information.
            </code></pre>
            <blockquote>This is a blockquote. It's great for highlighting important information.</blockquote>

            <h3>Code Blocks</h3>
            <pre className="bg-muted p-2 rounded-md"><code>
            ```javascript<br/>
            console.log("Hello, World!");<br/>
            ```
            </code></pre>
            
            <h3>Tables</h3>
            <pre className="bg-muted p-2 rounded-md"><code>
                | Header 1 | Header 2 |<br/>
                |----------|----------|<br/>
                | Cell 1   | Cell 2   |<br/>
                | Cell 3   | Cell 4   |
            </code></pre>
             <div className="overflow-x-auto">
                <table>
                    <thead>
                        <tr><th>Header 1</th><th>Header 2</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Cell 1</td><td>Cell 2</td></tr>
                        <tr><td>Cell 3</td><td>Cell 4</td></tr>
                    </tbody>
                </table>
             </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Palette className="h-8 w-8 text-accent" />
                <div>
                     <CardTitle>Advanced Styling (HTML)</CardTitle>
                     <CardDescription>You can embed HTML directly in your Markdown for more advanced styling.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
           <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-4 bg-card-foreground/5 space-y-4">
               
                <div>
                  <h4 className="not-prose text-foreground font-semibold mb-2">Colored Text</h4>
                  <p className="text-sm">Use `span` tags with our theme's CSS variables to apply colors.</p>
                  <div className="p-4 border rounded-lg bg-card mt-2">
                    <p>This is <span style={{ color: 'hsl(var(--primary))' }}>primary color</span> text.</p>
                    <p>This is <span style={{ color: 'hsl(var(--accent))' }}>accent color</span> text.</p>
                    <p>This is <span style={{ color: 'hsl(var(--destructive))' }}>destructive color</span> text.</p>
                  </div>
                  <pre className="bg-muted p-2 rounded-md mt-2 text-xs"><code>
                    &lt;span style="color: hsl(var(--primary))"&gt;primary color&lt;/span&gt;
                  </code></pre>
                </div>

                <div>
                  <h4 className="not-prose text-foreground font-semibold mb-2">Images with Captions</h4>
                  <p className="text-sm">Use the `figure` and `figcaption` tags for better image presentation.</p>
                   <div className="p-4 border rounded-lg bg-card mt-2">
                      <figure>
                          <img src="https://placehold.co/600x400.png" alt="Placeholder" className="w-full rounded-md" data-ai-hint="fantasy landscape"/>
                          <figcaption className="text-center text-xs text-muted-foreground mt-2">This is a caption for the image above.</figcaption>
                      </figure>
                   </div>
                  <pre className="bg-muted p-2 rounded-md mt-2 text-xs"><code>
                    &lt;figure&gt;<br/>
                    &nbsp;&nbsp;&lt;img src="image_url.png" alt="description" /&gt;<br/>
                    &nbsp;&nbsp;&lt;figcaption&gt;This is a caption.&lt;/figcaption&gt;<br/>
                    &lt;/figure&gt;
                  </code></pre>
                </div>

                 <div>
                  <h4 className="not-prose text-foreground font-semibold mb-2">Alerts & Callouts</h4>
                  <p className="text-sm">Use styled `div` elements to create callouts for important information.</p>
                   <div className="space-y-4 mt-2">
                      <div className="p-4 rounded-lg border bg-secondary">
                          <strong className="text-secondary-foreground">Tip:</strong> This is a helpful tip to guide the user.
                      </div>
                      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive-foreground">
                          <strong className="text-destructive">Warning:</strong> Be careful with this action as it cannot be undone.
                      </div>
                   </div>
                  <pre className="bg-muted p-2 rounded-md mt-2 text-xs"><code>
                    {`<!-- Tip Box -->
<div class="p-4 rounded-lg border bg-secondary">
  <strong>Tip:</strong> This is a helpful tip.
</div>

<!-- Warning Box -->
<div class="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
  <strong style="color:hsl(var(--destructive))">Warning:</strong> Be careful.
</div>`}
                  </code></pre>
                </div>

           </div>
        </CardContent>
      </Card>
    </div>
  );
}
