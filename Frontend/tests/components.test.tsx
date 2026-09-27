import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../src/components/ui/Card";
import { Badge } from "../src/components/ui/Badge";
import { PageHeader } from "../src/components/ui/PageHeader";

describe("OFFBEAT Design System Components — Phase 1", () => {
  describe("Button Component", () => {
    it("renders primary button variant by default", () => {
      const html = renderToString(<Button>Click Me</Button>);
      expect(html).toContain("Click Me");
      expect(html).toContain("bg-gradient-to-r from-orange-500");
    });

    it("renders secondary and outline variants", () => {
      const secHtml = renderToString(<Button variant="secondary">Secondary</Button>);
      expect(secHtml).toContain("bg-slate-800/80");

      const outHtml = renderToString(<Button variant="outline">Outline</Button>);
      expect(outHtml).toContain("bg-transparent");
    });

    it("renders disabled state", () => {
      const html = renderToString(<Button disabled>Disabled</Button>);
      expect(html).toContain("disabled");
    });

    it("renders loading spinner when isLoading is true", () => {
      const html = renderToString(<Button isLoading>Loading</Button>);
      expect(html).toContain("animate-spin");
    });
  });

  describe("Input Component", () => {
    it("renders label, placeholder, and input element", () => {
      const html = renderToString(
        <Input label="Email Address" placeholder="Enter email" id="test-email" />
      );
      expect(html).toContain("Email Address");
      expect(html).toContain('placeholder="Enter email"');
      expect(html).toContain('id="test-email"');
    });

    it("renders error message when error prop is provided", () => {
      const html = renderToString(
        <Input label="Password" error="Password is required" />
      );
      expect(html).toContain("Password is required");
      expect(html).toContain("border-rose-500");
    });

    it("renders helper text when provided without error", () => {
      const html = renderToString(
        <Input label="Username" helperText="Must be unique" />
      );
      expect(html).toContain("Must be unique");
    });
  });

  describe("Card Component", () => {
    it("renders Card with header, title, description, and content", () => {
      const html = renderToString(
        <Card>
          <CardHeader>
            <CardTitle>Card Title Test</CardTitle>
            <CardDescription>Card Description Test</CardDescription>
          </CardHeader>
          <CardContent>Card Content Body</CardContent>
        </Card>
      );
      expect(html).toContain("Card Title Test");
      expect(html).toContain("Card Description Test");
      expect(html).toContain("Card Content Body");
      expect(html).toContain("rounded-xl");
    });
  });

  describe("Badge Component", () => {
    it("renders badge variants correctly", () => {
      const accentHtml = renderToString(<Badge variant="accent">Accent Tag</Badge>);
      expect(accentHtml).toContain("Accent Tag");
      expect(accentHtml).toContain("text-[#ff5a36]");

      const goldHtml = renderToString(<Badge variant="gold">Gold Tag</Badge>);
      expect(goldHtml).toContain("Gold Tag");
      expect(goldHtml).toContain("text-[#e5a93c]");

      const successHtml = renderToString(<Badge variant="success">Active</Badge>);
      expect(successHtml).toContain("Active");
      expect(successHtml).toContain("text-emerald-400");
    });
  });

  describe("PageHeader Component", () => {
    it("renders title, description, and badge", () => {
      const html = renderToString(
        <PageHeader
          title="Custom Page"
          description="Page description details"
          badge={<Badge variant="accent">New</Badge>}
        />
      );
      expect(html).toContain("Custom Page");
      expect(html).toContain("Page description details");
      expect(html).toContain("New");
    });
  });
});
