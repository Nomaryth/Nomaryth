'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Send, 
  Star, 
  Bug, 
  Lightbulb, 
  Heart, 
  Shield, 
  Zap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Rocket,
  Target,
  GitPullRequest
} from 'lucide-react';
import { useTranslation } from '@/context/i18n-context';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'ui' | 'content' | 'general';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Category = 'gameplay' | 'technical' | 'content' | 'community' | 'accessibility' | 'performance';

interface FeedbackData {
  type: FeedbackType;
  category: Category;
  priority: Priority;
  title: string;
  description: string;
  email: string;
  reproduction?: string;
  browser?: string;
  device?: string;
  includeSystemInfo: boolean;
  allowContact: boolean;
  subscribe: boolean;
}

const getFeedbackTypes = (t: any) => [
  {
    id: 'bug' as FeedbackType,
    icon: <Bug className="h-5 w-5" />,
    title: t('feedback.types.bug.title'),
    description: t('feedback.types.bug.description'),
    color: 'bg-red-500/10 border-red-500/20 text-red-600',
    accent: 'text-red-500'
  },
  {
    id: 'feature' as FeedbackType,
    icon: <Lightbulb className="h-5 w-5" />,
    title: t('feedback.types.feature.title'),
    description: t('feedback.types.feature.description'),
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
    accent: 'text-amber-500'
  },
  {
    id: 'improvement' as FeedbackType,
    icon: <TrendingUp className="h-5 w-5" />,
    title: t('feedback.types.improvement.title'),
    description: t('feedback.types.improvement.description'),
    color: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
    accent: 'text-blue-500'
  },
  {
    id: 'ui' as FeedbackType,
    icon: <Sparkles className="h-5 w-5" />,
    title: t('feedback.types.ui.title'),
    description: t('feedback.types.ui.description'),
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
    accent: 'text-purple-500'
  },
  {
    id: 'content' as FeedbackType,
    icon: <Globe className="h-5 w-5" />,
    title: t('feedback.types.content.title'),
    description: t('feedback.types.content.description'),
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    accent: 'text-emerald-500'
  },
  {
    id: 'general' as FeedbackType,
    icon: <MessageCircle className="h-5 w-5" />,
    title: t('feedback.types.general.title'),
    description: t('feedback.types.general.description'),
    color: 'bg-slate-500/10 border-slate-500/20 text-slate-600',
    accent: 'text-slate-500'
  }
];

const categories = [
  { id: 'gameplay' as Category, label: 'Gameplay & Mechanics', icon: <Target className="h-4 w-4" /> },
  { id: 'technical' as Category, label: 'Technical Issues', icon: <GitPullRequest className="h-4 w-4" /> },
  { id: 'content' as Category, label: 'Content & Lore', icon: <Globe className="h-4 w-4" /> },
  { id: 'community' as Category, label: 'Community Features', icon: <Users className="h-4 w-4" /> },
  { id: 'accessibility' as Category, label: 'Accessibility', icon: <Shield className="h-4 w-4" /> },
  { id: 'performance' as Category, label: 'Performance', icon: <Rocket className="h-4 w-4" /> }
];

const priorities = [
  { id: 'low' as Priority, label: 'Low', color: 'bg-green-500', description: 'Minor issue or nice-to-have' },
  { id: 'medium' as Priority, label: 'Medium', color: 'bg-yellow-500', description: 'Moderate impact on experience' },
  { id: 'high' as Priority, label: 'High', color: 'bg-orange-500', description: 'Significant impact, needs attention' },
  { id: 'critical' as Priority, label: 'Critical', color: 'bg-red-500', description: 'Breaks functionality, urgent fix needed' }
];

export default function FeedbackPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const feedbackTypes = getFeedbackTypes(t);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'general',
    category: 'gameplay',
    priority: 'medium',
    title: '',
    description: '',
    email: user?.email || '',
    reproduction: '',
    browser: '',
    device: '',
    includeSystemInfo: true,
    allowContact: true,
    subscribe: false
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        browser: navigator.userAgent,
        device: /Mobile|Android|iP(ad|od|hone)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      }));
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.type && formData.category;
      case 2:
        return formData.title.trim().length >= 5 && formData.description.trim().length >= 20;
      case 3:
        return formData.email.includes('@');
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep() && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </motion.div>
                
                <h1 className="text-3xl font-bold font-headline text-foreground mb-4">
                  {t('feedback.success_title')}
                </h1>
                
                <p className="text-muted-foreground mb-8 text-lg">
                  {t('feedback.success_message')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {t('feedback.return_home')}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setStep(1);
                      setFormData({
                        type: 'general',
                        category: 'gameplay',
                        priority: 'medium',
                        title: '',
                        description: '',
                        email: user?.email || '',
                        reproduction: '',
                        browser: '',
                        device: '',
                        includeSystemInfo: true,
                        allowContact: true,
                        subscribe: false
                      });
                    }}
                  >
                    {t('feedback.submit_another')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-headline text-foreground mb-4">
            {t('feedback.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('feedback.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-accent">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span className={step >= 1 ? 'text-accent' : ''}>Type & Category</span>
                <span className={step >= 2 ? 'text-accent' : ''}>Details</span>
                <span className={step >= 3 ? 'text-accent' : ''}>Contact Info</span>
                <span className={step >= 4 ? 'text-accent' : ''}>Review & Submit</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-accent" />
                    What type of feedback do you have?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feedbackTypes.map((type) => (
                      <motion.div
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all duration-200 border-2",
                            formData.type === type.id
                              ? `${type.color} border-opacity-100`
                              : "border-border/50 hover:border-accent/50"
                          )}
                          onClick={() => setFormData({ ...formData, type: type.id })}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={cn("mb-3", formData.type === type.id ? type.accent : "text-muted-foreground")}>
                              {type.icon}
                            </div>
                            <h3 className="font-semibold mb-2">{type.title}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-semibold mb-4 block">Which area does this relate to?</Label>
                    <Select value={formData.category} onValueChange={(value: Category) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {category.icon}
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Tell us more about it
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4 block">How urgent is this?</Label>
                    <RadioGroup
                      value={formData.priority}
                      onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {priorities.map((priority) => (
                        <div key={priority.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={priority.id} id={priority.id} />
                          <Label htmlFor={priority.id} className="flex items-center gap-2 cursor-pointer">
                            <div className={cn("w-3 h-3 rounded-full", priority.color)} />
                            <div>
                              <div className="font-medium">{priority.label}</div>
                              <div className="text-xs text-muted-foreground">{priority.description}</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      A brief, descriptive title for your feedback
                    </p>
                    <Input
                      id="title"
                      placeholder="e.g., Map loading takes too long on mobile devices"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/100 characters (minimum 5)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Provide detailed information about your feedback
                    </p>
                    <Textarea
                      id="description"
                      placeholder="Please describe your feedback in detail. Include what you expected to happen vs what actually happened, or your suggestions for improvement..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/1000 characters (minimum 20)
                    </p>
                  </div>

                  {formData.type === 'bug' && (
                    <div>
                      <Label htmlFor="reproduction" className="text-base font-semibold">Steps to Reproduce</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Help us understand how to reproduce this issue
                      </p>
                      <Textarea
                        id="reproduction"
                        placeholder="1. Go to... &#10;2. Click on... &#10;3. Notice that..."
                        value={formData.reproduction}
                        onChange={(e) => setFormData({ ...formData, reproduction: e.target.value })}
                        rows={4}
                        className="text-base resize-none"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      We'll use this to follow up on your feedback if needed
                    </p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contact"
                        checked={formData.allowContact}
                        onCheckedChange={(checked) => setFormData({ ...formData, allowContact: !!checked })}
                      />
                      <Label htmlFor="contact" className="text-sm">
                        Allow us to contact you about this feedback for clarification or updates
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subscribe"
                        checked={formData.subscribe}
                        onCheckedChange={(checked) => setFormData({ ...formData, subscribe: !!checked })}
                      />
                      <Label htmlFor="subscribe" className="text-sm">
                        Subscribe to our newsletter for Nomaryth updates and announcements
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="systeminfo"
                        checked={formData.includeSystemInfo}
                        onCheckedChange={(checked) => setFormData({ ...formData, includeSystemInfo: !!checked })}
                      />
                      <Label htmlFor="systeminfo" className="text-sm">
                        Include my browser and device information to help debug technical issues
                      </Label>
                    </div>
                  </div>

                  {formData.includeSystemInfo && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>System Info to be included:</strong><br />
                        Browser: {formData.browser ? formData.browser.substring(0, 80) + '...' : 'Unknown'}<br />
                        Device: {formData.device}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    Review Your Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-semibold">Type</div>
                        <div className="text-sm text-muted-foreground">
                          {feedbackTypes.find(t => t.id === formData.type)?.title}
                        </div>
                      </div>
                      <Badge variant="outline" className={priorities.find(p => p.id === formData.priority)?.color}>
                        {priorities.find(p => p.id === formData.priority)?.label} Priority
                      </Badge>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-semibold mb-2">Title</div>
                      <div className="text-foreground">{formData.title}</div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-semibold mb-2">Description</div>
                      <div className="text-foreground whitespace-pre-wrap">{formData.description}</div>
                    </div>

                    {formData.reproduction && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="font-semibold mb-2">Reproduction Steps</div>
                        <div className="text-foreground whitespace-pre-wrap">{formData.reproduction}</div>
                      </div>
                    )}

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="font-semibold mb-2">Contact</div>
                      <div className="text-foreground">{formData.email}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formData.allowContact ? '✓ Contact allowed' : '✗ No contact'}
                        {formData.subscribe && ' • ✓ Subscribed to newsletter'}
                        {formData.includeSystemInfo && ' • ✓ System info included'}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      Thank you for taking the time to provide feedback! Your insights help us continuously improve Nomaryth.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mt-8"
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i + 1 <= step ? "bg-accent" : "bg-muted"
                )}
              />
            ))}
          </div>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep()}
              className="flex items-center gap-2 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep() || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
